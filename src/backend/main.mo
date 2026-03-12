import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";

actor {
  type DecisionEntry = {
    timestamp : Int;
    action : Text;
    reason : Text;
    speed : Float;
    distanceToObstacle : Float;
  };

  var decisionLog : [DecisionEntry] = [];
  var totalDecisions = 0;
  var stopCount = 0;
  var changeLaneCount = 0;
  var slowDownCount = 0;
  var goCount = 0;

  public shared ({ caller }) func makeDecision(speed : Float, distanceToObstacle : Float, trafficLight : Text, laneBlocked : Bool) : async {
    action : Text;
    reason : Text;
  } {
    var action : Text = "GO";
    var reason : Text = "Path clear – maintaining speed";

    if (distanceToObstacle < 0.0 or speed < 0.0) {
      Runtime.trap("Invalid input values. Distance and speed must be non-negative");
    };

    switch (trafficLight) {
      case ("red") {
        action := "STOP";
        reason := "Red light ahead";
      };
      case ("yellow") {
        if (speed > 30.0) {
          action := "SLOW_DOWN";
          reason := "Slowing down for yellow light";
        } else {
          action := "GO";
          reason := "Safe to proceed – yellow light";
        };
      };
      case ("green") { reason := "Green light – clear path" };
      case ("amber") {
        if (speed > 30.0) {
          action := "SLOW_DOWN";
          reason := "Slowing down for amber light";
        } else {
          action := "GO";
          reason := "Safe to proceed – amber light";
        };
      };
      case (_) { reason := "Unknown traffic light state – proceeding with caution" };
    };

    if (distanceToObstacle < 50.0 and action != "STOP") {
      if (laneBlocked) {
        action := "STOP";
        reason := "Obstacle ahead, no lane available";
      } else {
        action := "CHANGE_LANE";
        reason := "Obstacle detected – changing lane";
      };
    } else if (distanceToObstacle < 100.0 and action != "STOP") {
      action := "SLOW_DOWN";
      reason := "Obstacle nearby – reducing speed";
    };

    totalDecisions += 1;
    switch (action) {
      case ("STOP") { stopCount += 1 };
      case ("CHANGE_LANE") { changeLaneCount += 1 };
      case ("SLOW_DOWN") { slowDownCount += 1 };
      case ("GO") { goCount += 1 };
      case (_) {};
    };

    let newEntry : DecisionEntry = {
      timestamp = Time.now();
      action;
      reason;
      speed;
      distanceToObstacle;
    };

    decisionLog := [newEntry].concat(decisionLog);

    if (decisionLog.size() > 20) {
      decisionLog := decisionLog.sliceToArray(0, 20);
    };

    { action; reason };
  };

  public query ({ caller }) func getDecisionLog() : async [DecisionEntry] {
    decisionLog;
  };

  public query ({ caller }) func getStats() : async {
    totalDecisions : Nat;
    stopCount : Nat;
    changeLaneCount : Nat;
    slowDownCount : Nat;
    goCount : Nat;
  } {
    {
      totalDecisions;
      stopCount;
      changeLaneCount;
      slowDownCount;
      goCount;
    };
  };

  public shared ({ caller }) func resetLog() : async () {
    decisionLog := [];
    totalDecisions := 0;
    stopCount := 0;
    changeLaneCount := 0;
    slowDownCount := 0;
    goCount := 0;
  };
};
