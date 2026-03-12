import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DecisionEntry {
    distanceToObstacle: number;
    action: string;
    speed: number;
    timestamp: bigint;
    reason: string;
}
export interface backendInterface {
    getDecisionLog(): Promise<Array<DecisionEntry>>;
    getStats(): Promise<{
        slowDownCount: bigint;
        totalDecisions: bigint;
        stopCount: bigint;
        changeLaneCount: bigint;
        goCount: bigint;
    }>;
    makeDecision(speed: number, distanceToObstacle: number, trafficLight: string, laneBlocked: boolean): Promise<{
        action: string;
        reason: string;
    }>;
    resetLog(): Promise<void>;
}
