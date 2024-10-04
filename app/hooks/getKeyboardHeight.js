import {useEffect, useState} from 'react';
import {Keyboard} from 'react-native';
export default function useGetKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardShowing, setIsKeyboardShowing] = useState(false);

  useEffect(() => {
    function onKeyboardDidShow(e) {
      setKeyboardHeight(e.endCoordinates.height);
    }

    function onKeyboardDidHide() {
      setKeyboardHeight(0);
    }
    function onKeyboardWillHide() {
      setIsKeyboardShowing(false);
    }
    function onKeyboardWillShow() {
      setIsKeyboardShowing(true);
    }

    const showSubscription = Keyboard.addListener(
      'keyboardDidShow',
      onKeyboardDidShow,
    );
    const hideSubscription = Keyboard.addListener(
      'keyboardDidHide',
      onKeyboardDidHide,
    );

    const isGoingToHide = Keyboard.addListener(
      'keyboardWillHide',
      onKeyboardWillHide,
    );
    const isGoingToShow = Keyboard.addListener(
      'keyboardWillShow',
      onKeyboardWillShow,
    );
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
      isGoingToHide.remove();
      isGoingToShow.remove();
    };
  }, []);

  return {keyboardHeight: keyboardHeight, isShowing: isKeyboardShowing};
}
