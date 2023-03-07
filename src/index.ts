import axios from "axios";
import logger from "consola";

const checkIn = async (cookie: string) => {
  const url = "https://glados.rocks/api/user/checkin";
  const url2 = "https://glados.rocks/api/user/status";
  const referer = "https://glados.rocks/console/checkin";
  const origin = "https://glados.rocks";
  const useragent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36";
  const payload = {
    token: "glados.network",
  };
  try {
    const checkinRes = await axios.post(url, payload, {
      headers: {
        cookie,
        referer,
        origin,
        "user-agent": useragent,
        "content-type": "application/json;charset=UTF-8",
      },
    });
    const stateRes = await axios.get(url2, {
      headers: {
        cookie,
        referer,
        origin,
        "user-agent": useragent,
      },
    });
    const msg = checkinRes.data.message;
    const leftDays = stateRes.data.data.leftDays.split(".")[0];
    return `checkin: ${checkinRes.status}\nstate: ${stateRes.status}\nmsg: ${msg}\nleftDays: ${leftDays} days
    `;
  } catch (e) {
    throw e;
  }
};
(async () => {
  const cookie = process.env.cookie;
  if (!cookie) {
    logger.error("Please configure cookie env!");
    return;
  }
  try {
    const msg = await checkIn(cookie);
    logger.info("Checkin success");
    // send dingtalk
    const dingHookAddress = process.env.dingdingWebhookAddress;
    if (dingHookAddress) {
      const dingdingRes = await axios.post(dingHookAddress, {
        msgtype: "text",
        text: { content: msg },
      });
    }
  } catch (e) {
    logger.error("Program error", e);
  }
})();
