/**
 * Converts a number to Indian Rupees in words.
 * Handles Crores, Lakhs, Thousands, Hundreds.
 * Example: 123456 -> "One Lakh Twenty Three Thousand Four Hundred Fifty Six"
 */
export const numberToWords = (n) => {
    if (n === 0) return "Zero";

    const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const convertChunk = (num) => {
        let str = "";
        if (num > 99) {
            str += units[Math.floor(num / 100)] + " Hundred";
            num %= 100;
            if (num > 0) str += " and ";
            else str += " ";
        }
        if (num > 19) {
            str += tens[Math.floor(num / 10)] + " ";
            num %= 10;
        }
        if (num > 0) {
            if (num < 10) str += units[num] + " ";
            else if (num < 20) str += teens[num - 10] + " ";
        }
        return str.trim();
    };

    let result = "";

    // Crores
    if (n >= 10000000) {
        result += convertChunk(Math.floor(n / 10000000)) + " Crore ";
        n %= 10000000;
    }

    // Lakhs
    if (n >= 100000) {
        result += convertChunk(Math.floor(n / 100000)) + " Lakh ";
        n %= 100000;
    }

    // Thousands
    if (n >= 1000) {
        result += convertChunk(Math.floor(n / 1000)) + " Thousand ";
        n %= 1000;
    }

    // Remaining (Hundreds/Tens/Units)
    if (n > 0) {
        result += convertChunk(n);
    }

    return result.trim();
};
