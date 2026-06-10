export interface SuccessResponse<T> {
  remote: 'success';
  data: T;
}

export interface FailureResponse {
  remote: 'failure';
  errors: {
    status?: number;
    errors: any;
  };
}
// type ErrorResponse = {
//   remote: 'failure';
//   errors: {
//     status: number;
//     errors: {
//       [field: string]: string[]; // e.g., "PhoneNumber": ["Phone number is already taken!"]
//     };
//   };
// };

export interface GetCarouselResponseData {
  id: string;
  manage_content_type: 'homepage';
  title: string;
  image: string;
  description: string;
}
export interface ContentItemResponseData {
  id: string;
  manage_content_type: 'privacy-policy' | string; // adjust as needed
  title: string | null;
  image: string | null;
  description: string; // contains HTML content
}
