import axios from 'axios'
import { RANDOM_NUMBERS_API_URL } from '../constants/constants'

export async function getRandomNumbers() {
  const data = JSON.stringify({
    jsonrpc: '2.0',
    method: 'generateIntegers',
    params: {
      apiKey: import.meta.env.VITE_APP_API_KEY,
      n: 50,
      min: 1,
      max: 6,
      replacement: true
    },
    id: 42
  })

  const config = {
    method: 'post',
    url: RANDOM_NUMBERS_API_URL,
    headers: {
      'Content-Type': 'application/json'
    },
    data
  }

  try {
    const response = await axios(config);
    if (response.data && response.data.result && response.data.result.random) {
      return response.data.result.random.data;
    }
    return [];
  } catch (error) {
    console.log(error);
    return [];
  }
}
