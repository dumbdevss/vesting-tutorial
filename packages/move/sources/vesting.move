module blockchain::vesting {
    use std::signer;
    use aptos_framework::account;
    use std::option::{Self, Option};
    use aptos_framework::timestamp;
    use std::simple_map::{Self, SimpleMap};
    use aptos_framework::event;
    use aptos_framework::coin::{Self, Coin};
    use std::vector;
    use aptos_framework::aptos_coin::AptosCoin;
    use std::debug;
    use std::string::String;

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
    const ERROR_INVALID_STREAM_IDS: u64 = 11;

    /// Event emitted when a new stream is created
    struct StreamCreatedEvent has drop, store {
        beneficiary: address,
        total_amount: u64,
        start_time: u64,
        cliff: u64,
        duration: u64
    }

    /// Event emitted when tokens are claimed
    struct ClaimCreatedEvent has drop, store {
        beneficiary: address,
        amount: u64,
        timestamp: u64
    }

    /// Represents a single vesting stream
    struct VestingStream has store, copy, drop {
        stream_id: String,
        beneficiary: address,
        total_amount: u64,
        start_time: u64,
        cliff: u64,
        duration: u64,
        claimed_amount: u64,
        creator: address
    }

    /// Main vesting contract resource
    struct VestingContract has key, copy, drop {
        owner: address,
        streams: SimpleMap<String, VestingStream>,
        streams_vec: vector<VestingStream>
    }

    struct State has key {
        signer_cap: account::SignerCapability,
        stream_created: event::EventHandle<StreamCreatedEvent>,
        claimed: event::EventHandle<ClaimCreatedEvent>
    }

    fun init_module(admin: &signer) {
        let (resource_signer, signer_cap) = account::create_resource_account(admin, SEED);

        // Initialize the vesting contract with resource account as owner
        let streams = simple_map::create();
        let streams_vec = vector::empty<VestingStream>();
        let vesting_contract = VestingContract {
            owner: signer::address_of(&resource_signer),
            streams,
            streams_vec
        };

        // Register the resource account for AptosCoin
        if (!coin::is_account_registered<AptosCoin>(signer::address_of(&resource_signer))) {
            coin::register<AptosCoin>(&resource_signer);
        };

        move_to(&resource_signer, vesting_contract);
        move_to(&resource_signer, State {
            signer_cap,
            stream_created: account::new_event_handle<StreamCreatedEvent>(&resource_signer),
            claimed: account::new_event_handle<ClaimCreatedEvent>(&resource_signer)
        })
    }

    /// Deposit AptosCoin to the vesting contract
    public entry fun deposit(
        owner: &signer,
        amount: u64
    ) acquires State {
        let resources_address = account::create_resource_address(&@blockchain, SEED);
        assert!(signer::address_of(owner) == @blockchain, ERROR_NOT_OWNER);
        assert!(amount > 0, ERROR_INVALID_AMOUNT);

        let state = borrow_global<State>(resources_address);
        let resource_signer = account::create_signer_with_capability(&state.signer_cap);

        let coins = coin::withdraw<AptosCoin>(owner, amount);
        coin::deposit<AptosCoin>(signer::address_of(&resource_signer), coins);
    }

    /// Create a new vesting stream
    public entry fun create_stream(
        owner: &signer,
        user: address,
        total_amount: u64,
        duration: u64,
        cliff: u64,
        stream_id: String
    ) acquires VestingContract, State {
        let resources_address = account::create_resource_address(&@blockchain, SEED);
        assert!(signer::address_of(owner) == @blockchain, ERROR_NOT_OWNER);
        assert!(!has_stream(stream_id), ERROR_STREAM_EXISTS);
        assert!(duration > 0, ERROR_INVALID_DURATION);
        assert!(total_amount > 0, ERROR_INVALID_AMOUNT);
        assert!(cliff <= duration, ERROR_CLIFF_EXCEEDS_DURATION);
        assert!(coin::balance<AptosCoin>(resources_address) > total_amount, ERROR_INSUFFICIENT_FUNDS);

        let vesting_stream = VestingStream {
            stream_id,
            beneficiary: user,
            total_amount,
            start_time: timestamp::now_seconds(),
            duration,
            cliff,
            claimed_amount: 0,
            creator: signer::address_of(owner)
        };

        let contract = borrow_global_mut<VestingContract>(resources_address);
        let state = borrow_global_mut<State>(resources_address);
        simple_map::add(&mut contract.streams, stream_id, vesting_stream);
        vector::push_back(&mut contract.streams_vec, vesting_stream);

        event::emit_event(&mut state.stream_created, StreamCreatedEvent{
            beneficiary: vesting_stream.beneficiary,
            total_amount: vesting_stream.total_amount,
            start_time: vesting_stream.start_time,
            duration: vesting_stream.duration,
            cliff: vesting_stream.cliff
        })
    }

    /// Create multiple vesting streams
    public entry fun create_multiple_streams(
        owner: &signer,
        users: vector<address>,
        total_amounts: vector<u64>,
        durations: vector<u64>,
        cliffs: vector<u64>,
        stream_ids: vector<String>
    ) acquires VestingContract, State {
        let resources_address = account::create_resource_address(&@blockchain, SEED);
        assert!(signer::address_of(owner) == @blockchain, ERROR_NOT_OWNER);
        let len = vector::length(&users);
        assert!(len == vector::length(&total_amounts), ERROR_INVALID_AMOUNT);
        assert!(len == vector::length(&durations), ERROR_INVALID_DURATION);
        assert!(len == vector::length(&cliffs), ERROR_INVALID_DURATION);
        assert!(len == vector::length(&stream_ids), ERROR_INVALID_STREAM_IDS);

        // Calculate total required amount
        let total_required = 0;
        let i = 0;
        while (i < len) {
            let amount = *vector::borrow(&total_amounts, i);
            total_required = total_required + amount;
            i = i + 1;
        };
        assert!(coin::balance<AptosCoin>(resources_address) >= total_required, ERROR_INSUFFICIENT_FUNDS);

        let contract = borrow_global_mut<VestingContract>(resources_address);
        let state = borrow_global_mut<State>(resources_address);

        i = 0;
        while (i < len) {
            let user = *vector::borrow(&users, i);
            let total_amount = *vector::borrow(&total_amounts, i);
            let duration = *vector::borrow(&durations, i);
            let cliff = *vector::borrow(&cliffs, i);
            let stream_id = *vector::borrow(&stream_ids, i);

            assert!(!has_stream_multiple(*contract, stream_id), ERROR_STREAM_EXISTS);
            assert!(duration > 0, ERROR_INVALID_DURATION);
            assert!(total_amount > 0, ERROR_INVALID_AMOUNT);
            assert!(cliff <= duration, ERROR_CLIFF_EXCEEDS_DURATION);

            let vesting_stream = VestingStream {
                stream_id,
                beneficiary: user,
                total_amount,
                start_time: timestamp::now_seconds(),
                duration,
                cliff,
                claimed_amount: 0,
                creator: signer::address_of(owner)
            };

            simple_map::add(&mut contract.streams, stream_id, vesting_stream);

            event::emit_event(&mut state.stream_created, StreamCreatedEvent{
                beneficiary: vesting_stream.beneficiary,
                total_amount: vesting_stream.total_amount,
                start_time: vesting_stream.start_time,
                duration: vesting_stream.duration,
                cliff: vesting_stream.cliff
            });

            i = i + 1;
        }
    }

    // get the vested amount
    #[view]
    public fun get_vested_amount(
        stream_id: String,
        current_time: u64
    ): u64 acquires VestingContract {
        let resources_address = account::create_resource_address(&@blockchain, SEED);
        assert!(has_stream(stream_id), ERROR_STREAM_NOT_FOUND);
        let contract = borrow_global<VestingContract>(resources_address);

        let stream = simple_map::borrow(&contract.streams, &stream_id);

        // If we're still in cliff period, return 0
        if (current_time < (stream.start_time + stream.cliff)) {
            0
        } else {
            // After cliff period, if no tokens claimed, return total amount
            if (stream.claimed_amount == 0 && current_time >=  (stream.start_time + stream.duration)) {
                stream.total_amount
            } else {
                // Otherwise calculate the normal vesting schedule
                calculate_current_vested_without_cliff_amount(
                    stream.total_amount,
                    stream.start_time,
                    stream.duration,
                    current_time
                )
            }
        }
    }

    /// Claim vested tokens
    public entry fun claim(
        beneficiary: &signer,
        stream_id: String,
        amount_to_claim: u64
    ) acquires VestingContract, State {
        let resources_address = account::create_resource_address(&@blockchain, SEED);
        let beneficiary_addr = signer::address_of(beneficiary);
        assert!(has_stream(stream_id), ERROR_STREAM_NOT_FOUND);
        let contract = borrow_global_mut<VestingContract>(resources_address);
        let state = borrow_global_mut<State>(resources_address);
        let resource_signer = account::create_signer_with_capability(&state.signer_cap);

        let stream = simple_map::borrow_mut(&mut contract.streams, &stream_id);
        let now_seconds = timestamp::now_seconds();

        // Check if cliff period has passed
        assert!(now_seconds >= (stream.cliff + stream.start_time), ERROR_CLIFF_HAS_NOT_PASSED);
        if (now_seconds >= (stream.duration + stream.start_time)) {
            now_seconds = stream.duration + stream.start_time;
        };
        assert!(amount_to_claim > 0, ERROR_INVALID_AMOUNT);

        let current_vested = calculate_current_vested_without_cliff_amount(
            stream.total_amount,
            stream.start_time,
            stream.duration,
            now_seconds
        );

        // Check if we've already claimed all currently vested tokens
        assert!(stream.claimed_amount < current_vested, ERROR_NOTHING_TO_CLAIM);

        // Calculate actual claimable amount (minus what's already been claimed)
        let actual_claimable = current_vested - stream.claimed_amount;
        assert!(actual_claimable > 0, ERROR_NOTHING_TO_CLAIM);

        assert!(coin::balance<AptosCoin>(resources_address) > actual_claimable, ERROR_INSUFFICIENT_FUNDS);
        let coin_with = coin::withdraw<AptosCoin>(&resource_signer, amount_to_claim);
        coin::deposit<AptosCoin>(beneficiary_addr, coin_with);

        // Update claimed amount
        stream.claimed_amount = stream.claimed_amount + amount_to_claim;
        event::emit_event(&mut state.claimed, ClaimCreatedEvent{
            beneficiary: beneficiary_addr,
            amount: amount_to_claim,
            timestamp: now_seconds
        })
    }

    /// View function to get stream details
    #[view]
    public fun get_stream(
        stream_id: String
    ): (u64, u64, u64, u64, u64) acquires VestingContract {
        let resources_address = account::create_resource_address(&@blockchain, SEED);

        assert!(has_stream(stream_id), ERROR_STREAM_NOT_FOUND);
        let contract = borrow_global<VestingContract>(resources_address);

        let stream = simple_map::borrow(&contract.streams, &stream_id);
        (
            stream.total_amount,
            stream.start_time,
            stream.cliff,
            stream.duration,
            stream.claimed_amount
        )
    }

    /// View function to get stream details
    #[view]
    public fun get_all_streams(
    ): vector<VestingStream> acquires VestingContract {
        let resources_address = account::create_resource_address(&@blockchain, SEED);
        
        let contract = borrow_global<VestingContract>(resources_address);

        contract.streams_vec
    }

    /// View function to get all stream details for a user
    #[view]
    public fun get_streams_for_user(
        user_address: address
    ): Option<vector<VestingStream>> acquires VestingContract {
        let resources_address = account::create_resource_address(&@blockchain, SEED);

        // Check if the VestingContract exists at the resource address
        if (!exists<VestingContract>(resources_address)) {
           option::none<VestingStream>();
        };

        let contract = borrow_global<VestingContract>(resources_address);
        let streams_vec = &contract.streams_vec;
        let len = vector::length(streams_vec);
        let result = vector::empty<VestingStream>();

        // Iterate through streams to find all matching user_address
        let i = 0;
        while (i < len) {
            let stream = vector::borrow(streams_vec, i);
            if (stream.beneficiary == user_address) {
                vector::push_back(&mut result, *stream)
            };
            i = i + 1;
        };

        if (vector::length(&result) > 0) {
            option::some(result)
        } else {
            option::none()
        }
    }

    /// Check if an address has a vesting stream
    inline fun has_stream(
        stream_id: String
    ): bool acquires VestingContract {
        let resources_address = account::create_resource_address(&@blockchain, SEED);
        let contract = borrow_global<VestingContract>(resources_address);
        simple_map::contains_key(&contract.streams, &stream_id)
    }

    /// Check if an address has a vesting stream
    inline fun has_stream_multiple(
        contract: VestingContract,
        stream_id: String
    ): bool {
        simple_map::contains_key(&contract.streams, &stream_id)
    }

    /// Helper function to calculate claimable amount
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