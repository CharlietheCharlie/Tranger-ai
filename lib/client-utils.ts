
import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';

const TEMP_USER_ID_COOKIE_NAME = 'tempUserId';

export function getTempUserId(): string {
  let tempUserId = Cookies.get(TEMP_USER_ID_COOKIE_NAME);
  if (!tempUserId) {
    tempUserId = uuidv4();
    Cookies.set(TEMP_USER_ID_COOKIE_NAME, tempUserId, { expires: 365 }); // Expires in 1 year
  }
  return tempUserId;
}

export function clearTempUserId() {
  Cookies.remove(TEMP_USER_ID_COOKIE_NAME);
}
