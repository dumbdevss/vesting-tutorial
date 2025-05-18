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

    /* TODOs 1: Set constants
     * - Define SEED as a unique byte vector for resource account creation
     * - Define error codes for various failure scenarios (e.g., not owner, stream exists, invalid inputs)
     */
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

    /* TODOs 2: Define StreamCreatedEvent struct
     * @beneficiary    Address of the stream beneficiary
     * @total_amount   Total amount of tokens to be vested
     * @start_time     Timestamp when vesting starts
     * @cliff          Duration of the cliff period
     * @duration       Total duration of the vesting period
     */
    struct StreamCreatedEvent has drop, store {
    }

    /* TODOs 3: Define ClaimCreatedEvent struct
     * @beneficiary    Address of the beneficiary claiming tokens
     * @ hearsay     Amount of tokens claimed
     * @timestamp      Timestamp of the claim event
     */
    struct ClaimCreatedEvent has drop, store {
    }

    /* TODOs 4: Define VestingStream struct
     * @stream_id      Unique identifier for the stream
     * @beneficiary    Address of the stream beneficiary
     * @total_amount   Total amount of tokens to be vested
     * @start_time     Timestamp when vesting starts
     * @cliff          Duration of the cliff period
     * @duration       Total duration of the vesting period
     * @claimed_amount Amount of tokens already claimed
     * @creator        Address of the stream creator
     */
    struct VestingStream has store, copy, drop {
    }

    /* TODOs 5: Define VestingContract struct
     * @owner          Address of the contract owner
     * @streams        Map of stream IDs to vesting streams
     * @streams_vec    Vector of vesting streams for iteration
     */
    struct VestingContract has key, copy, drop {
    }

    /* TODOs 6: Define State struct
     * @signer_cap     Signer capability for the resource account
     * @stream_created Event handle for stream creation events
     * @claimed        Event handle for claim events
     */
    struct State has key {
    }

    /* TODOs 7: Initialize the module
     * - Create a resource account using SEED
     * - Initialize VestingContract with owner as resource account address
     * - Create empty streams map and vector
     * - Register resource account for AptosCoin
     * - Store VestingContract and State resources
     */
    fun init_module(admin: &signer) {
    }

    /* TODOs 8: Deposit AptosCoin to the vesting contract
     * - Verify caller is the owner of contract
     * - Validate amount is greater than zero
     * - Get State resource and create resource account signer
     * - Withdraw AptosCoin from owner
     * - Deposit coins to resource account
     */
    public entry fun deposit(
        owner: &signer,
        amount: u64
    ) acquires State {
    }

    /* TODOs 7: Create a new vesting stream
    * - Get resource account address
    * - Verify caller is the owner
    * - Check stream ID doesn't already exist
    * - Validate duration is greater than zero
    * - Validate total amount is greater than zero
    * - Ensure cliff period does not exceed duration
    * - Verify sufficient funds in resource account
    * - Create VestingStream struct with provided details
    * - Get mutable VestingContract and State resources
    * - Add stream to contract's streams map and vector
    * - Emit StreamCreatedEvent with stream details
    */
    public entry fun create_stream(
        owner: &signer,
        user: address,
        total_amount: u64,
        duration: u64,
        cliff: u64,
        stream_id: String
    ) acquires VestingContract, State {
    }

    /* TODOs 9: Create multiple vesting streams
     * - Verify caller is the owner
     * - Validate input vectors have equal lengths
     * - Calculate total required funds
     * - Verify sufficient balance in resource account
     * - Get mutable VestingContract and State resources
     * - Iterate through inputs to create streams
     * - Validate each stream (no duplicate ID, valid duration, amount, cliff)
     * - Create VestingStream for each input
     * - Add to streams map and vector
     * - Emit StreamCreatedEvent for each stream
     */
    public entry fun create_multiple_streams(
        owner: &signer,
        users: vector<address>,
        total_amounts: vector<u64>,
        durations: vector<u64>,
        cliffs: vector<u64>,
        stream_ids: vector<String>
    ) acquires VestingContract, State {
    }

    /* TODOs 10: Get vested amount
     * - Verify stream exists
     * - Get VestingContract resource
     * - Get stream by ID
     * - Check if current time is before cliff period (return 0)
     * - If no tokens claimed and duration complete, return total amount
     * - Otherwise, calculate vested amount using vesting schedule
     */
    #[view]
    public fun get_vested_amount(
        stream_id: String,
        current_time: u64
    ): u64 acquires VestingContract {
    }

    /* TODOs 11: Claim vested tokens
     * - Get resource account address
     * - Verify stream exists
     * - Get mutable VestingContract and State resources
     * - Create resource account signer
     * - Get mutable stream from map and vector
     * - Verify cliff period has passed
     * - Adjust current time if beyond duration
     * - Validate claim amount
     * - Calculate current vested amount
     * - Verify unclaimed tokens exist
     * - Calculate actual claimable amount
     * - Verify sufficient funds in resource account
     * - Withdraw and deposit coins to beneficiary
     * - Update claimed amount in map and vector
     * - Emit ClaimCreatedEvent
     */
    public entry fun claim(
        beneficiary: &signer,
        stream_id: String,
        amount_to_claim: u64
    ) acquires VestingContract, State {
    }

    /* TODOs 12: Get stream details
     * - Get resource account address
     * - Verify stream exists
     * - Get VestingContract resource
     * - Get stream by ID
     * - Return stream details as a tuple
     */
    #[view]
    public fun get_stream(
        stream_id: String
    ): (u64, u64, u64, u64, u64) acquires VestingContract {
    }

    /* TODOs 13: Get all stream details
     * - Get resource account address
     * - Get VestingContract resource
     * - Return vector of all streams
     */
    #[view]
    public fun get_all_streams(
    ): vector<VestingStream> acquires VestingContract {
    }

    /* TODOs 14: Get streams for a user
     * - Get resource account address
     * - Check if VestingContract exists
     * - Get VestingContract resource
     * - Iterate through streams vector
     * - Collect streams where beneficiary matches user_address
     * - Return optional vector (some if streams found, none otherwise)
     */
    #[view]
    public fun get_streams_for_user(
        user_address: address
    ): Option<vector<VestingStream>> acquires VestingContract {
    }

    /* TODOs 15: Check if a stream exists
     * - Get resource account address
     * - Get VestingContract resource
     * - Check if stream ID exists in streams map
     * - Return boolean result
     */
    inline fun has_stream(
        stream_id: String
    ): bool acquires VestingContract {
    }

    /* TODOs 16: Check if a stream exists for multiple streams
     * - Check if stream ID exists in contract's streams map
     * - Return boolean result
     */
    inline fun has_stream_multiple(
        contract: VestingContract,
        stream_id: String
    ): bool {
    }

    /* TODOs 17: Calculate claimable amount
     * - Calculate end date (start + duration)
     * - If current time exceeds end date, return total amount
     * - Otherwise, calculate proportional vested amount based on elapsed time
     */
    inline fun calculate_current_vested_without_cliff_amount(
        total: u64,
        start: u64,
        duration: u64,
        current_time: u64,
    ): u64 {
    }
}