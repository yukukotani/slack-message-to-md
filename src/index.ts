// プログラマティックAPI

export { handleInvalidJson, handleMissingContent } from "./libs/errorHandler";
export type { ConversionResult, FileElement, SlackMessage } from "./libs/types";
// CLI
export { handleCli } from "./presentation/cli";

import type { SlackMessage, UserMapping } from "./libs/types";
import {
  convertMessage as convertMessageUsecase,
  convertMessageWithValidation as convertMessageWithValidationUsecase,
} from "./usecase/convertMessage";

export function convertMessage(
  message: SlackMessage,
  userMapping?: UserMapping,
): string {
  const res = convertMessageUsecase(message, userMapping);
  if (res.success) {
    return res.markdown;
  }

  throw res.error;
}

export function convertMessageWithValidation(
  message: unknown,
  userMapping?: UserMapping,
): string {
  const res = convertMessageWithValidationUsecase(message, userMapping);
  if (res.success) {
    return res.markdown;
  }
  throw res.error;
}
