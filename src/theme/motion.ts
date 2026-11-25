import { Animated, AccessibilityInfo, Easing } from 'react-native';
import { useEffect, useRef, useState } from 'react';

const ease = Easing.out(Easing.cubic);

/** Respeta la preferencia de movimiento reducido del sistema. */
export function useReduceMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (active && value) setReduce(true);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);
  return reduce;
}

/** Entrada escalonada: fade + translateY, 600 ms, curva suave. */
export function useEntrance(index = 0, reduce = false) {
  const opacity = useRef(new Animated.Value(reduce ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(reduce ? 0 : 12)).current;

  useEffect(() => {
    if (reduce) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }
    const animation = Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, delay: index * 70, easing: ease, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 600, delay: index * 70, easing: ease, useNativeDriver: true }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [index, reduce, opacity, translateY]);

  return { opacity, transform: [{ translateY }] };
}

/** Micro-interacción de presión con resorte, análoga a los magnetic buttons. */
export function usePress(reduce = false, target = 0.98) {
  const scale = useRef(new Animated.Value(1)).current;
  return {
    scale,
    onPressIn: () => {
      if (reduce) return;
      Animated.spring(scale, { toValue: target, speed: 45, bounciness: 1, useNativeDriver: true }).start();
    },
    onPressOut: () => {
      if (reduce) return;
      Animated.spring(scale, { toValue: 1, speed: 32, bounciness: 4, useNativeDriver: true }).start();
    },
  };
}

/** Pulso breve al completar una tarea. */
export function usePulse(reduce = false) {
  const scale = useRef(new Animated.Value(1)).current;
  const pulse = () => {
    if (reduce) return;
    scale.setValue(0.72);
    Animated.spring(scale, { toValue: 1, speed: 20, bounciness: 7, useNativeDriver: true }).start();
  };
  return { scale, pulse };
}
