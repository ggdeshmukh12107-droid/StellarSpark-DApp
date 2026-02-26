#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};

const DONATIONS: Symbol = symbol_short!("donations");
const TARGET: Symbol = symbol_short!("target");
const DEADLINE: Symbol = symbol_short!("deadline");
const STARTED: Symbol = symbol_short!("started");

#[contract]
pub struct CrowdfundingContract;

#[contractimpl]
impl CrowdfundingContract {
    pub fn initialize(env: Env, target_amount: i128, deadline_step: u64) {
        if env.storage().instance().has(&STARTED) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&TARGET, &target_amount);
        env.storage().instance().set(&DEADLINE, &(env.ledger().timestamp() + deadline_step));
        env.storage().instance().set(&DONATIONS, &0i128);
        env.storage().instance().set(&STARTED, &true);
    }

    pub fn donate(env: Env, donor: Address, amount: i128) {
        donor.require_auth();

        let deadline: u64 = env.storage().instance().get(&DEADLINE).unwrap();
        if env.ledger().timestamp() > deadline {
            panic!("Deadline passed");
        }

        let mut total_donations: i128 = env.storage().instance().get(&DONATIONS).unwrap_or(0);
        total_donations += amount;

        env.storage().instance().set(&DONATIONS, &total_donations);

        // Emit event for real-time tracking
        env.events().publish((symbol_short!("donation"), donor), amount);
    }

    pub fn get_status(env: Env) -> (i128, i128, u64) {
        let total: i128 = env.storage().instance().get(&DONATIONS).unwrap_or(0);
        let target: i128 = env.storage().instance().get(&TARGET).unwrap_or(0);
        let deadline: u64 = env.storage().instance().get(&DEADLINE).unwrap_or(0);
        (total, target, deadline)
    }
}
