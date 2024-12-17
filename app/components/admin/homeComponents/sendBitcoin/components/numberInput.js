import {useEffect, useState} from 'react';
import CustomNumberKeyboard from '../../../../../functions/CustomElements/customNumberKeyboard';
import {useGlobalContextProvider} from '../../../../../../context-store/context';

export default function NumberInputSendPage({setPaymentInfo, paymentInfo}) {
  const {masterInfoObject} = useGlobalContextProvider();
  const [amount, setAmount] = useState(paymentInfo?.sendAmount);

  useEffect(() => {
    setPaymentInfo(prev => {
      return {...prev, sendAmount: amount};
    });
  }, [amount]);

  return (
    <CustomNumberKeyboard
      showDot={masterInfoObject.userBalanceDenomination === 'fiat'}
      setInputValue={setAmount}
    />
  );
}
