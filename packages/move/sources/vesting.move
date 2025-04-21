module blockchain::vesting {
    use std::signer;
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use std::simple_map::{Self, SimpleMap};
    use aptos_framework::event;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;

    /// Error codes
    const SEED: vector<u8> = b"vesting";
    const ERROR_NOT_OWNER: u64 = 1;
    const ERROR_STREAM_EXISTS: u64 = 2;
    const ERROR_STREAM_NOT_FOUND: u64 = 3;
    const ERROR_INVALID_DURATION: u64 = 4;
    const ERROR_NO_VESTED_TOKENS: u64 = 5;
    const ERROR_CLIFF_EXCEEDS_DURATION: u64 = 6;
    const ERROR_NOTHING_TO_CLAIM: u64 = 7;
    const ERROR_INVALID_AMOUNT: u64 = 8;
    const ERROR_CLIFF_HAS_NOT_PASSED: u64 = 9;
    const ERROR_INSUFFICIENT_FUNDS: u64 = 10;

    /// Event emitted when a new stream is created
    struct StreamCreatedEvent has drop, store {
        beneficiary: address,
        total_amount: u64, // Now represents APT (in microAPT)
        start_time: u64,
        cliff: u64,
        duration: u64
    }

    /// Event emitted when tokens are claimed
    struct ClaimCreatedEvent has drop, store {
        beneficiary: address,
        amount: u64, // Now represents APT (in microAPT)
        timestamp: u64
    }

    /// Represents a single vesting stream
    struct VestingStream has store, copy, drop {
        beneficiary: address,
        total_amount: u64, // Total APT to vest (in microAPT)
        start_time: u64,
        cliff: u64,
        duration: u64,
        claimed_amount: u64, // APT already claimed (in microAPT)
    }

    /// Main vesting contract resource
    struct VestingContract has key {
        owner: address,
        streams: SimpleMap<address, VestingStream>,
        tokens: Coin<AptosCoin>, // Holds the APT for vesting
    }

    struct State has key {
        signer_cap: account::SignerCapability,
        stream_created: event::EventHandle<StreamCreatedEvent>,
        claimed: event::EventHandle<ClaimCreatedEvent>
    }

    fun init_module(admin: &signer) {
        let (resource_signer, signer_cap) = account::create_resource_account(admin, SEED);
        let resource_addr = signer::address_of(&resource_signer);

        // Register the resource account to receive APT
        if (!coin::is_account_registered<AptosCoin>(resource_addr)) {
            coin::register<AptosCoin>(&resource_signer);
        };

        // Initialize the vesting contract with resource account as owner
        let streams = simple_map::create();
        let vesting_contract = VestingContract {
            owner: resource_addr,
            streams,
            tokens: coin::zero<AptosCoin>(), // Initialize with zero APT
        };

        move_to(&resource_signer, vesting_contract);
        move_to(&resource_signer, State {
            signer_cap,
            stream_created: account::new_event_handle<StreamCreatedEvent>(&resource_signer),
            claimed: account::new_event_handle<ClaimCreatedEvent>(&resource_signer)
        });
    }

    /// Create a new vesting stream with APT deposit
    public entry fun create_stream(
        owner: &signer,
        user: address,
        total_amount: u64, // APT amount in microAPT
        duration: u64,
        cliff: u64
    ) acquires VestingContract, State {
        let resources_address = account::create_resource_address(&@blockchain, SEED);
        assert!(signer::address_of(owner) == @blockchain, ERROR_NOT_OWNER);
        assert!(!has_stream(user), ERROR_STREAM_EXISTS);
        assert!(duration > 0, ERROR_INVALID_DURATION);
        assert!(total_amount > 0, ERROR_INVALID_AMOUNT);
        assert!(cliff <= duration, ERROR_CLIFF_EXCEEDS_DURATION);
        assert!(coin::balance<AptosCoin>(signer::address_of(owner)) >= total_amount, ERROR_INSUFFICIENT_FUNDS);

        // Withdraw APT from owner and deposit into contract
        let tokens = coin::withdraw<AptosCoin>(owner, total_amount);

        let vesting_stream = VestingStream {
            beneficiary: user,
            total_amount,
            start_time: timestamp::now_seconds(),
            duration,
            cliff,
            claimed_amount: 0
        };

        let contract = borrow_global_mut<VestingContract>(resources_address);
        let state = borrow_global_mut<State>(resources_address);
        coin::merge(&mut contract.tokens, tokens); // Add APT to contract
        simple_map::add(&mut contract.streams, user, vesting_stream);

        event::emit_event(&mut state.stream_created, StreamCreatedEvent{
            beneficiary: vesting_stream.beneficiary,
            total_amount: vesting_stream.total_amount,
            start_time: vesting_stream.start_time,
            duration: vesting_stream.duration,
            cliff: vesting_stream.cliff
        });
    }

    // Get the vested amount (unchanged logic, just APT context)
    #[view]
    public fun get_vested_amount(
        beneficiary: address,
        current_time: u64
    ): u64 acquires VestingContract {
        let resources_address = account::create_resource_address(&@blockchain, SEED);
        assert!(has_stream(beneficiary), ERROR_STREAM_NOT_FOUND);
        let contract = borrow_global<VestingContract>(resources_address);

        let stream = simple_map::borrow(&contract.streams, &beneficiary);

        if (current_time < (stream.start_time + stream.cliff)) {
            0
        } else {
            if (stream.claimed_amount == 0 && current_time >= (stream.start_time + stream.duration)) {
                stream.total_amount
            } else {
                calculate_current_vested_without_cliff_amount(
                    stream.total_amount,
                    stream.start_time,
                    stream.duration,
                    current_time
                )
            }
        }
    }

    /// Claim vested APT tokens
    public entry fun claim(
        beneficiary: &signer,
        amount_to_claim: u64 // APT amount in microAPT
    ) acquires VestingContract, State {
        let resources_address = account::create_resource_address(&@blockchain, SEED);
        let beneficiary_addr = signer::address_of(beneficiary);

        assert!(has_stream(beneficiary_addr), ERROR_STREAM_NOT_FOUND);

        let contract = borrow_global_mut<VestingContract>(resources_address);
        let state = borrow_global_mut<State>(resources_address);
        let stream = simple_map::borrow_mut(&mut contract.streams, &beneficiary_addr);
        let now_seconds = timestamp::now_seconds();

        // Check if cliff period has passed
        assert!(now_seconds >= (stream.cliff + stream.start_time), ERROR_CLIFF_HAS_NOT_PASSED);
        assert!(now_seconds <= (stream.duration + stream.start_time), ERROR_INVALID_DURATION);
        assert!(amount_to_claim > 0, ERROR_INVALID_AMOUNT);

        let current_vested = calculate_current_vested_without_cliff_amount(
            stream.total_amount,
            stream.start_time,
            stream.duration,
            now_seconds
        );

        assert!(stream.claimed_amount < current_vested, ERROR_NOTHING_TO_CLAIM);
        let actual_claimable = current_vested - stream.claimed_amount;
        assert!(actual_claimable >= amount_to_claim, ERROR_NOTHING_TO_CLAIM);

        // Update claimed amount and transfer APT
        stream.claimed_amount = stream.claimed_amount + amount_to_claim;
        let claimed_tokens = coin::extract(&mut contract.tokens, amount_to_claim);
        coin::deposit<AptosCoin>(beneficiary_addr, claimed_tokens);

        event::emit_event(&mut state.claimed, ClaimCreatedEvent{
            beneficiary: beneficiary_addr,
            amount: amount_to_claim,
            timestamp: now_seconds
        });
    }

    /// View function to get stream details (unchanged, just APT context)
    #[view]
    public fun get_stream(
        beneficiary: address
    ): (u64, u64, u64, u64, u64) acquires VestingContract {
        let resources_address = account::create_resource_address(&@blockchain, SEED);
        assert!(has_stream(beneficiary), ERROR_STREAM_NOT_FOUND);
        let contract = borrow_global<VestingContract>(resources_address);

        let stream = simple_map::borrow(&contract.streams, &beneficiary);
        (
            stream.total_amount,
            stream.start_time,
            stream.cliff,
            stream.duration,
            stream.claimed_amount
        )
    }

    /// Check if an address has a vesting stream
    inline fun has_stream(
        beneficiary: address
    ): bool acquires VestingContract {
        let resources_address = account::create_resource_address(&@blockchain, SEED);
        let contract = borrow_global<VestingContract>(resources_address);
        simple_map::contains_key(&contract.streams, &beneficiary)
    }

    /// Helper function to calculate claimable amount (unchanged logic)
    inline fun calculate_current_vested_without_cliff_amount(
        total: u64,
        start: u64,
        duration: u64,
        current_time: u64,
    ): u64 {
        let end_date = start + duration;
        if (current_time > end_date) {
            total
        } else {
            let current_duration = current_time - start;
            let total = (current_duration * total) / duration;
            total
        }
    }
}