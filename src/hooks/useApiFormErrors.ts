import {useCallback} from 'react';
import {FieldValues, Path, UseFormSetError} from 'react-hook-form';

import {ApiFieldErrors} from '../api/apiIndex';

/**
 * Returns a stable callback that maps a backend `ApiFieldErrors` map into
 * react-hook-form inline field errors via the supplied `setError`.
 *
 * Each entry becomes a `setError(field, { type: 'server', message })` call.
 * The callback returns the list of field names it attempted to set, so the
 * caller can decide whether to also surface a generic toast for any fields
 * the form doesn't render (we can't introspect RHF's registered fields from
 * here, so we leave that decision to the caller).
 *
 * No-ops and returns `[]` when `fieldErrors` is undefined or empty.
 */
export function useApiFormErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
): (fieldErrors: ApiFieldErrors | undefined) => string[] {
  return useCallback(
    (fieldErrors: ApiFieldErrors | undefined): string[] => {
      if (!fieldErrors) {
        return [];
      }
      const names = Object.keys(fieldErrors);
      if (names.length === 0) {
        return [];
      }
      for (const name of names) {
        const message = fieldErrors[name];
        setError(name as Path<T>, {type: 'server', message});
      }
      return names;
    },
    [setError],
  );
}

export default useApiFormErrors;
