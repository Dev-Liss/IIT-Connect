import { useRef } from "react";
import { PanResponder } from "react-native";
import { useRouter } from "expo-router";

const SWIPE_TAB_ORDER = ["index", "academic", "more", "profile"];
const SWIPE_TAB_PATHS = {
  index: "/",
  academic: "/academic",
  more: "/more",
  profile: "/profile",
};

const SWIPE_MIN_DX = 24; // smaller = more responsive
const SWIPE_HORIZONTAL_RATIO = 1.15; // smaller = more lenient angle

export default function useMainTabSwipe(currentTab) {
  const router = useRouter();
  const swipingRef = useRef(false);
  const pendingTargetRef = useRef(null);
  const isSwipableTab = SWIPE_TAB_ORDER.includes(currentTab);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      if (!isSwipableTab) return false;

      const { dx, dy } = gestureState;
      return (
        Math.abs(dx) > SWIPE_MIN_DX &&
        Math.abs(dx) > Math.abs(dy) * SWIPE_HORIZONTAL_RATIO
      );
    },
    onPanResponderGrant: () => {
      swipingRef.current = false;
      pendingTargetRef.current = null;
    },
    onPanResponderMove: (evt, gestureState) => {
      if (!isSwipableTab || swipingRef.current) return;

      const { dx } = gestureState;
      const currentIdx = SWIPE_TAB_ORDER.indexOf(currentTab);
      if (currentIdx < 0) return;

      const direction = dx < 0 ? 1 : -1; // swipe left => next, swipe right => previous
      const targetIdx = currentIdx + direction;
      const targetName = SWIPE_TAB_ORDER[targetIdx];
      if (!targetName) return;

      swipingRef.current = true;
      pendingTargetRef.current = targetName;
    },
    onPanResponderRelease: () => {
      if (!isSwipableTab || !swipingRef.current) return;

      const targetName = pendingTargetRef.current;
      const path = targetName ? SWIPE_TAB_PATHS[targetName] : null;
      if (path) {
        router.replace(path);
      }

      swipingRef.current = false;
      pendingTargetRef.current = null;
    },
    onPanResponderTerminate: () => {
      swipingRef.current = false;
      pendingTargetRef.current = null;
    },
    onShouldBlockNativeResponder: () => true,
  });

  return {
    panHandlers: panResponder.panHandlers,
  };
}
