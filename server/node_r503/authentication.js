const Binding = require('@serialport/bindings');
const comName = '/dev/ttyUSB0';

const openOptions = {
    baudRate: 57600,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
};

const binding = new Binding();

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function finger_authentication(hashcode1) {
    try {
        await binding.open(comName, openOptions);
        console.log('Serial port is open');

        const commandBuffer5 = Buffer.from([0xEF, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0x01, 0x00, 0x04, 0x09, 0x01,0x00, 0x0F]);
        await binding.write(commandBuffer5);
        console.log('Sixth command sent');
        await delay(600);
        const header5 = Buffer.alloc(12);
        await binding.read(header5, 0, 12);
        console.log('Upload to sensor:', header5);

        if(header5[9]==0x00){
            console.log("Ready to download template to sensor");
            /* let hexString = hashcode.toString('hex');
            hexString = hexString.toUpperCase();
            let upperhashcode = Buffer.from(hexString, 'hex'); */
            const rawData = hashcode1;
            const pkt = 139;
            for (let i = 0; i < rawData.length; i += pkt) {
                const chunk = rawData.slice(i, i + pkt);
                const buffer = Buffer.from(chunk);
                await binding.write(buffer);
                console.log(chunk)
                console.log("Packet Sent")
            }
        console.log('DATA sent');
        await delay(600);
        }

        const commandBuffer7 = Buffer.from([0xEF, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0x01, 0x00, 0x03, 0x03, 0x00, 0x07]);
        await binding.write(commandBuffer7);
        console.log('Seventh command sent');
        await delay(600);
        const header7 = Buffer.alloc(14);
        await binding.read(header7, 0, 14);
        console.log('Matching', header7);
        if(header7[9]==0){
            await binding.close();
            return true;
        }
        else{
            await binding.close();
            return false;
        }
        }
    catch (error) {
        await binding.close();
        console.error('Error:', error);
    }
}

module.exports=finger_authentication;


