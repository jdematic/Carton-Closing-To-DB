//Service for Dematic Dashboard Screwfix trentham to read date from PLCs
//Created by: JWL
//Date: 2023/02/02 21:27:41
//Last modified: 2023/09/03 14:31:53
//Version: 0.0.1

import snap7 from "node-snap7";
import snap7Types from "./types.js";

var s7client = new snap7.S7Client();

//enum for the different types of data that can be read from the PLC
enum DataType {
  Bit = 1,
  Byte = 2,
  Word = 3,
  DWord = 4,
  real = 5,
  timer = 6,
  counter = 7,
}

//read a bit from a DB
async function readFromS7DBToBit(ipAddress: string, rack: number, slot: number, dbNumber: number, offset: number) {
  return new Promise<number>((resolve, reject) => {
    try {
      console.log("bool");
      // Create a new client and connect to the PLC
      var s7client = new snap7.S7Client();
      s7client.ConnectTo(ipAddress, rack, slot, function (err) {
        //if error fall to catch block in function
        if (err) {
          console.log("error: " + s7client.ErrorText(err));
          reject(s7client.ErrorText(err));
          return;
        }

        //offset is byte.bit
        var offsetSplit = offset.toString().split(".");
        var byte = parseInt(offsetSplit[0]);
        var bit = parseInt(offsetSplit[1]);

        // Read the data from the PLC
        s7client.ReadArea(snap7Types.Area.S7AreaDB, dbNumber, byte, 1, snap7Types.WordLen.S7WLByte, function (err, buffer) {
          if (err) {
            reject(s7client.ErrorText(err));

            return;
          }

          try {
            // Disconnect from the PLC
            s7client.Disconnect();

            let bitValue = buffer.readUInt8(0) & (1 << bit);
            bitValue = bitValue >> bit;

            // Return "true" if the bit is set, "false" if it is not

            resolve(bitValue);
          } catch (error) {
            console.log(error);
            reject(error);
            return;
          }
        });
      });
    } catch (error) {
      console.error(error);
      reject(error);
      return;
    }
  });
}

//read from a DB and convert to int
async function readFromS7DBToInt(ipAddress: string, rack: number, slot: number, dbNumber: number, offset: number, length: DataType) {
  return new Promise<number>((resolve, reject) => {
    try {
      // Create a new client and connect to the PLC
      var s7client = new snap7.S7Client();
      s7client.ConnectTo(ipAddress, rack, slot, function (err) {
        //if error fall to catch block in function
        if (err) {
          console.log("error: " + s7client.ErrorText(err));
          reject(s7client.ErrorText(err));
          return;
        }

        switch (length) {
          case snap7Types.WordLen.S7WLByte:
            // Read the data from the PLC
            s7client.ReadArea(snap7Types.Area.S7AreaDB, dbNumber, offset, 1, snap7Types.WordLen.S7WLByte, function (err, buffer) {
              if (err) {
                reject(s7client.ErrorText(err));

                return;
              }

              try {
                // Disconnect from the PLC
                s7client.Disconnect();

                let int = buffer.readUInt8(0);
                // Return the buffer
                resolve(int);
              } catch (error) {
                console.log(error);
                reject(error);
                return;
              }
            });
            break;

          case snap7Types.WordLen.S7WLWord:
            // Read the data from the PLC
            s7client.ReadArea(snap7Types.Area.S7AreaDB, dbNumber, offset, 1, snap7Types.WordLen.S7WLWord, function (err, buffer) {
              if (err) {
                reject(s7client.ErrorText(err));
                return;
              }

              try {
                // Disconnect from the PLC
                s7client.Disconnect();

                let int = buffer.readUInt16BE(0);

                // Return the buffer
                resolve(int);
              } catch (error) {
                console.log(error);
                reject(error);
                return;
              }
            });
            break;

          case snap7Types.WordLen.S7WLDWord:
            // Read the data from the PLC
            s7client.ReadArea(snap7Types.Area.S7AreaDB, dbNumber, offset, 1, snap7Types.WordLen.S7WLDWord, function (err, buffer) {
              if (err) {
                reject(s7client.ErrorText(err));
                return;
              }

              try {
                // Disconnect from the PLC
                s7client.Disconnect();

                let int = buffer.readUInt32BE(0);

                // Return the buffer
                resolve(int);
              } catch (error) {
                console.log(error);
                reject(error);
                return;
              }
            });
            break;

          case snap7Types.WordLen.S7WLTimer:
            // Read the data from the PLC
            s7client.ReadArea(snap7Types.Area.S7AreaDB, dbNumber, offset, 1, snap7Types.WordLen.S7WLWord, function (err, buffer) {
              if (err) {
                console.log("error: " + s7client.ErrorText(err));
                reject(s7client.ErrorText(err));
                return;
              }

              try {
                // Disconnect from the PLC
                s7client.Disconnect();

                let hex = bytesToHexString(buffer);
                let main = parseInt(hex.substring(1, 4));

                switch (hex.substring(0, 1)) {
                  case "0":
                    main = main / 100;
                    break;
                  case "1":
                    main = main / 10;
                    break;
                  case "2":
                    main = main / 1;
                    break;
                  case "3":
                    main = main / 0.1;
                    break;
                }

                console.log(main);

                // Return the buffer
                resolve(main);
              } catch (error) {
                console.log(error);
                reject(error);
                return;
              }
            });
            break;
        }
      });
    } catch (error) {
      console.error(error);
      reject(error);
      return;
    }
  });
}

//read from a DB and convert to int
async function readFromS7MarkerToInt(ipAddress: string, rack: number, slot: number, offset: number, length: DataType) {
  return new Promise<number>((resolve, reject) => {
    try {
      // Create a new client and connect to the PLC
      var s7client = new snap7.S7Client();
      s7client.ConnectTo(ipAddress, rack, slot, function (err) {
        //if error fall to catch block in function
        if (err) {
          console.log("error: " + s7client.ErrorText(err));
          reject(s7client.ErrorText(err));
          return;
        }

        // Read the data from the PLC
        s7client.MBRead(offset, 2, function (err, buffer) {
          if (err) {
            reject(s7client.ErrorText(err));

            return;
          }

          try {
            // Disconnect from the PLC
            s7client.Disconnect();

            let int = parseInt(buffer[0].toString(16) + buffer[1].toString(16));
            // Return the buffer
            resolve(int);
          } catch (error) {
            console.log(error);
            reject(error);
            return;
          }
        });
      });
    } catch (error) {
      console.error(error);
      reject(error);
      return;
    }
  });
}

//convert byte array to hex string
function bytesToHexString(arr: Buffer) {
  var hex = "";
  for (var i = 0; i < arr.length; i++) {
    hex += (arr[i] >>> 4).toString(16);
    hex += (arr[i] & 0xf).toString(16);
  }
  return hex;
}

//export the function
export default { readFromS7DBToInt, readFromS7MarkerToInt, readFromS7DBToBit, DataType };
