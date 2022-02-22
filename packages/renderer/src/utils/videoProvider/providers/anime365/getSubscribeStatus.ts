import {API_BASE, isFailureResponse, request} from '/@/utils/videoProvider/providers/anime365/utils';

interface SubscribeStatus {
  isLogined: boolean,
  name: string,
  isPremium: boolean
  premiumUntil: string
}

export async function getSubscribeStatus(access_token?: string, options?: RequestInit) {
  const requestURL = new URL('me', API_BASE);
  const apiResponse = await request<SubscribeStatus>(requestURL, access_token, options);

  if (isFailureResponse(apiResponse)) {
    throw apiResponse;
  }

  return apiResponse.data;
}
