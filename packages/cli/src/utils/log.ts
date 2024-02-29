import chalk, {ColorName} from 'chalk'

/**
 * Logs a message to the console with specified color
 * @param message - The message to log
 * @param color - The color/style to apply to the message
 */
export function log(message: string, color: ColorName) {
  if (chalk[color]) {
    return console.log(chalk[color](message))
  } else {
    console.error('Invalid color:', color)
  }
}
