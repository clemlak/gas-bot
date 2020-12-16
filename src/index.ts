import dotenv from 'dotenv';
import axios from 'axios';
import {
  Client,
  MessageEmbed,
} from 'discord.js';
import {
  utils,
} from 'ethers';

interface GasNowResponse {
  code: number;
  data: {
    rapid: number,
    fast: number;
    standard: number;
    slow: number;
    timestamp: number;
  }
}

dotenv.config();

const {
  token,
} = process.env;

const client = new Client();

client.on('ready', () => {
  console.log('I am ready');
});

client.on('message', async (message) => {
  try {
    if (message.content === '!gas') {
      const res = await axios.get('https://www.gasnow.org/api/v3/gas/price?utm_source=:YourAPPName');
      const gasNowResponse = res.data as GasNowResponse;

      const rapid = utils.parseUnits(gasNowResponse.data.rapid.toString(), 'wei');
      const fast = utils.parseUnits(gasNowResponse.data.fast.toString(), 'wei');
      const standard = utils.parseUnits(gasNowResponse.data.standard.toString(), 'wei');
      const slow = utils.parseUnits(gasNowResponse.data.slow.toString(), 'wei');

      const embed = new MessageEmbed({
        title: '⛽ Current gas prices',
        description: 'Here are the current gas prices:',
        timestamp: gasNowResponse.data.timestamp,
        fields: [
          {
            name: '🚀 Rapid | 15 seconds',
            value: `${utils.formatUnits(rapid, 'gwei')} Gwei`,
          },
          {
            name: '🚄 Fast | 1 minute',
            value: `${utils.formatUnits(fast, 'gwei')} Gwei`,
          },
          {
            name: '🚌 Standard | 3 minutes',
            value: `${utils.formatUnits(standard, 'gwei')} Gwei`,
          },
          {
            name: '🐢 Slow | > 10 minutes',
            value: `${utils.formatUnits(slow, 'gwei')} Gwei`,
          },
        ],
      });

      await message.channel.send(embed);
    }
  } catch (e) {
    console.error(e);
    await message.channel.send('Cannot access GasNow API...');
  }
});

client.login(token);

client.setInterval(async () => {
  try {
    const res = await axios.get('https://www.gasnow.org/api/v3/gas/price?utm_source=:YourAPPName');
    const gasNowResponse = res.data as GasNowResponse;

    const rapid = utils.parseUnits(gasNowResponse.data.rapid.toString(), 'wei');
    const fast = utils.parseUnits(gasNowResponse.data.fast.toString(), 'wei');
    const standard = utils.parseUnits(gasNowResponse.data.standard.toString(), 'wei');
    const slow = utils.parseUnits(gasNowResponse.data.slow.toString(), 'wei');

    const rapidGas = utils.formatUnits(rapid, 'gwei').split('.');
    const fastGas = utils.formatUnits(fast, 'gwei').split('.');
    const standardGas = utils.formatUnits(standard, 'gwei').split('.');
    const slowGas = utils.formatUnits(slow, 'gwei').split('.');

    const presence = await client.user?.setPresence({
      activity: {
        type: 'WATCHING',
        name: `🚀 ${rapidGas[0]} | 🚄 ${fastGas[0]} | 🚌 ${standardGas[0]} | 🐢 ${slowGas[0]}`,
      },
      status: 'online',
    });

    console.log(presence);
  } catch (e) {
    console.error(e);
  }
}, 15 * 1000);
