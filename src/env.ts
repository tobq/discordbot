import {config} from "dotenv";

config();

export function getRequiredEnvVar(varName: string) {
    let value = process.env[varName];
    if (value === undefined) {
        throw new Error(`${varName} env var missing`);
    }
    return value;
}

export function getRequiredNumericEnvVar(varName: string) {
    const varValue = getRequiredEnvVar(varName);
    const number = parseInt(varValue);
    if (isNaN(number))
        throw new Error(`Invalid numberic value for env var: ${varName}`)

    return number;
}