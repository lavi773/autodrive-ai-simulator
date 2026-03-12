import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useDecisionLog() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["decisionLog"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDecisionLog();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 2000,
  });
}

export function useStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getStats();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 2000,
  });
}

export function useResetLog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) return;
      return actor.resetLog();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decisionLog"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useMakeDecision() {
  const { actor } = useActor();
  return async (
    speed: number,
    distanceToObstacle: number,
    trafficLight: string,
    laneBlocked: boolean,
  ): Promise<{ action: string; reason: string }> => {
    if (!actor) throw new Error("No actor");
    return actor.makeDecision(
      speed,
      distanceToObstacle,
      trafficLight,
      laneBlocked,
    );
  };
}
