const SnowflakeID = require('./snowflake');

class SnowflakeDecoder {
  constructor() {
    this.TWEPOCH = 1288834974657n; // Custom epoch
    this.MACHINE_ID_BITS = 10n;
    this.SEQUENCE_BITS = 12n;
    this.TIMESTAMP_SHIFT = this.MACHINE_ID_BITS + this.SEQUENCE_BITS;
    this.MACHINE_ID_SHIFT = this.SEQUENCE_BITS;
  }

  decode(snowflakeId) {
    const id = BigInt(snowflakeId);
    const timestamp = (id >> this.TIMESTAMP_SHIFT) + this.TWEPOCH;
    const machineId = (id >> this.MACHINE_ID_SHIFT) & ((1n << this.MACHINE_ID_BITS) - 1n);
    const sequence = id & ((1n << this.SEQUENCE_BITS) - 1n);

    return {
      timestamp: new Date(Number(timestamp)), // Convert to readable date
      machineId: Number(machineId),
      sequence: Number(sequence)
    };
  }
}

// Example usage
const decoder = new SnowflakeDecoder();
const snowflakeId = process.argv[2]; // Accept ID as command-line argument

if (!snowflakeId) {
  console.log("Please provide a Snowflake ID to decode.");
  process.exit(1);
}

const decoded = decoder.decode(snowflakeId);
console.log("Decoded Snowflake ID:", decoded);
