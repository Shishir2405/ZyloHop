import {useMutation} from '@tanstack/react-query';
import {
  updateUserApi,
  changePasswordApi,
  deleteAccountApi,
  UpdateUserPayload,
  ChangePasswordPayload,
} from '../../api/userApis';

export function useUpdateUser() {
  return useMutation({
    mutationKey: ['updateUser'],
    mutationFn: async (data: UpdateUserPayload) => {
      return updateUserApi(data);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationKey: ['changePassword'],
    mutationFn: async (data: ChangePasswordPayload) => {
      return changePasswordApi(data);
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationKey: ['deleteAccount'],
    mutationFn: async () => {
      return deleteAccountApi();
    },
  });
}
