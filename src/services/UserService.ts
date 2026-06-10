import {
  getUserDetailsApi,
} from '../api/authApis';
import {
  SuccessResponse,
  FailureResponse,
} from '../api/types';
import { GetUserDetailApiResponse } from '../api/types/userTypes';

class UserService {
  /**
   * Fetch the current user profile.
   * This calls the /get-user endpoint from the UserController.
   */
  async getUserProfile(): Promise<SuccessResponse<GetUserDetailApiResponse> | FailureResponse> {
    try {
      const response = await getUserDetailsApi();
      return response;
    } catch (error: any) {
      return {
        remote: 'failure',
        errors: {
          errors: error?.message || 'Failed to fetch user profile',
        },
      };
    }
  }

  // TODO: Add methods for delivery address management when backend endpoints are mapped
}

export default new UserService();
