/**
 * Parses errors from Ethers.js and Smart Contracts to return user-friendly messages.
 * @param {Error} error - The raw error object caught in the try-catch block.
 * @returns {string} - A user-friendly error message.
 */
export const parseError = (error) => {
    console.error("Raw Error:", error);

    // 1. User Rejected Transaction
    if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        return "Transaction rejected by user.";
    }

    // 2. Ethers.js v6 Contract Revert Errors
    // Often buried in error.reason, error.info.error.message, or error.shortMessage
    if (error.reason) {
        return `Transaction Failed: ${cleanRevertReason(error.reason)}`;
    }

    if (error.shortMessage) {
        return `Error: ${cleanRevertReason(error.shortMessage)}`;
    }

    if (error.info && error.info.error && error.info.error.message) {
        return `Transaction Failed: ${cleanRevertReason(error.info.error.message)}`;
    }

    // 3. RPC Errors (MetaMask, etc.)
    if (error.data && error.data.message) {
        return `RPC Error: ${cleanRevertReason(error.data.message)}`;
    }

    if (error.message) {
        // Try to extract revert reason from long message strings
        const revertMatch = error.message.match(/execution reverted: (.*?)"/);
        if (revertMatch) {
            return `Transaction Failed: ${revertMatch[1]}`;
        }
        // Fallback to generic message if it's short enough, otherwise generic
        if (error.message.length < 100) {
            return `Error: ${error.message}`;
        }
    }

    return "An unexpected error occurred. Please check the console for details.";
};

/**
 * Helper to clean up common prefixes in revert strings.
 */
const cleanRevertReason = (reason) => {
    return reason
        .replace('execution reverted: ', '')
        .replace('Error: ', '')
        .replace('VM Exception while processing transaction: revert ', '');
};
