// import {calculateBoltzFee} from '../../../../../functions/boltz/calculateBoltzFee';
// import {getLiquidFees} from '../../../../../functions/liquidWallet';

// export default async function getLiquidAndBoltzFees() {
//   const liquidFees = await getLiquidFees();
//   const txSize = (148 + 3 * 34 + 10.5) / 100;

//   const [boltzFee, {limits}] = await calculateBoltzFee(1000, 'liquid-ln');

//   return {
//     liquidFees: Math.round(liquidFees.fees[0] * txSize),
//     boltzFee: boltzFee,
//     boltzSwapInfo: limits,
//   };
// }
