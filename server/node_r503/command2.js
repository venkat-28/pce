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

async function fingerprint_register(){
    try {
        await binding.open(comName, openOptions);
        console.log('Serial port is open');
        let flag=true;
        while(flag){
            const commandBuffer = Buffer.from([0xEF, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0x01, 0x00, 0x03, 0x28, 0x00, 0x2C]);
            await binding.write(commandBuffer);
            await delay(600);
            const header = Buffer.alloc(12);
            await binding.read(header, 0, 12);
            console.log('Header:', header);
            if(header[9]==0){
                flag=false
            }
            else{
                console.log('Finger not detected')
            }
        }

        const commandBuffer1 = Buffer.from([0xEF, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0x01, 0x00, 0x04, 0x02, 0x01, 0x00, 0x08]);
        await binding.write(commandBuffer1);
        console.log('Second command sent');
        await delay(600);
        const header1 = Buffer.alloc(12);
        await binding.read(header1, 0, 12);
        console.log('Header1:', header1);

        flag=true;
        while(flag){
            const commandBuffer2 = Buffer.from([0xEF, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0x01, 0x00, 0x03, 0x28, 0x00, 0x2C]);
            await binding.write(commandBuffer2);
            console.log('Third command sent');
            await delay(600);
            const header2 = Buffer.alloc(12);
            await binding.read(header2, 0, 12);
            console.log('Header2:', header2);
            if(header2[9]==0){
                flag=false
            }
            else{
                console.log('Finger not detected')
            }
        }

        const commandBuffer3 = Buffer.from([0xEF, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0x01, 0x00, 0x04, 0x02, 0x02, 0x00, 0x09]);
        await binding.write(commandBuffer3);
        console.log('Fourth command sent');
        await delay(600);
        const header3 = Buffer.alloc(12);
        await binding.read(header3, 0, 12);
        console.log('Header3:', header3);

        const commandBuffer4 = Buffer.from([0xEF, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0x01, 0x00, 0x03, 0x05, 0x00,0x09]);
        await binding.write(commandBuffer4);
        console.log('Fifth command sent');
        await delay(600);
        const header4 = Buffer.alloc(12);
        await binding.read(header4, 0, 12);
        console.log('Header4:', header4);

        if(header4[9]==0x00){
            console.log('Template generated');
            const commandBuffer5 = Buffer.from([0xEF, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0x01, 0x00, 0x04, 0x08, 0x01,0x00,0x0E]);
            await binding.write(commandBuffer5);
            console.log('Fifth command sent');
            await delay(600);
            const header5 = Buffer.alloc(12);
            await binding.read(header5, 0, 12);
            console.log('Header5:', header5);

            if(header5[9]==0x00){
                console.log("Ready to upload template to upper computer");
                var data = Buffer.alloc(0);
                while(1){
                    var header6 = Buffer.alloc(139);
                    await binding.read(header6, 0, 139);
                    console.log('Data:', header6);
                    data = Buffer.concat([data, header6]);
                    //console.log(data);
                    if(header6[6]==0x08){
                        await binding.close();
                        return data;
                    }
                }
            }
            else{
                console.log('Error:Unable to upload');
            }
        }
        else{
            console.log('Error:Template not generated');
        }
        await binding.close();
        console.log('Serial port is closed');
    } 
    catch (error) {
        console.error('Error:', error);
    }
}
module.exports = fingerprint_register;