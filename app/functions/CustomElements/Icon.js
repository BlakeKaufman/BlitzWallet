import {View} from 'react-native';
import {Circle, G, Line, Path, Svg} from 'react-native-svg';
import {COLORS} from '../../constants';
import {useGlobalContextProvider} from '../../../context-store/context';

export default function Icon({name, isActive, width = 20, height = 20, color}) {
  const {theme} = useGlobalContextProvider();
  return (
    <>
      {name === 'mail' ? (
        <Svg
          width={width}
          height={height}
          viewBox="0 0 24 24"
          fill={
            isActive
              ? theme
                ? COLORS.darkModeText
                : COLORS.lightModeText
              : 'transparent'
          }
          xmlns="http://www.w3.org/2000/svg">
          <G id="SVGRepo_iconCarrier">
            <Path
              d="M21 8L17.4392 9.97822C15.454 11.0811 14.4614 11.6326 13.4102 11.8488C12.4798 12.0401 11.5202 12.0401 10.5898 11.8488C9.53864 11.6326 8.54603 11.0811 6.5608 9.97822L3 8M6.2 19H17.8C18.9201 19 19.4802 19 19.908 18.782C20.2843 18.5903 20.5903 18.2843 20.782 17.908C21 17.4802 21 16.9201 21 15.8V8.2C21 7.0799 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V15.8C3 16.9201 3 17.4802 3.21799 17.908C3.40973 18.2843 3.71569 18.5903 4.09202 18.782C4.51984 19 5.07989 19 6.2 19Z"
              stroke={theme ? COLORS.darkModeText : COLORS.lightModeText}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"></Path>
          </G>
        </Svg>
      ) : name === 'apps' ? (
        <Svg
          width={width}
          height={height}
          viewBox="0 0 24 24"
          fill={
            isActive
              ? theme
                ? COLORS.darkModeText
                : COLORS.lightModeText
              : 'transparent'
          }
          xmlns="http://www.w3.org/2000/svg">
          <G id="SVGRepo_iconCarrier">
            <Path
              d="M14 17.5C14 16.0955 14 15.3933 14.3371 14.8889C14.483 14.6705 14.6705 14.483 14.8889 14.3371C15.3933 14 16.0955 14 17.5 14V14V14C18.9045 14 19.6067 14 20.1111 14.3371C20.3295 14.483 20.517 14.6705 20.6629 14.8889C21 15.3933 21 16.0955 21 17.5V17.5V17.5C21 18.9045 21 19.6067 20.6629 20.1111C20.517 20.3295 20.3295 20.517 20.1111 20.6629C19.6067 21 18.9045 21 17.5 21V21V21C16.0955 21 15.3933 21 14.8889 20.6629C14.6705 20.517 14.483 20.3295 14.3371 20.1111C14 19.6067 14 18.9045 14 17.5V17.5V17.5Z"
              stroke={theme ? COLORS.darkModeText : COLORS.lightModeText}
              strokeWidth="2"></Path>
            <Path
              d="M3 17.5C3 16.0955 3 15.3933 3.33706 14.8889C3.48298 14.6705 3.67048 14.483 3.88886 14.3371C4.39331 14 5.09554 14 6.5 14V14V14C7.90446 14 8.60669 14 9.11114 14.3371C9.32952 14.483 9.51702 14.6705 9.66294 14.8889C10 15.3933 10 16.0955 10 17.5V17.5V17.5C10 18.9045 10 19.6067 9.66294 20.1111C9.51702 20.3295 9.32952 20.517 9.11114 20.6629C8.60669 21 7.90446 21 6.5 21V21V21C5.09554 21 4.39331 21 3.88886 20.6629C3.67048 20.517 3.48298 20.3295 3.33706 20.1111C3 19.6067 3 18.9045 3 17.5V17.5V17.5Z"
              stroke={theme ? COLORS.darkModeText : COLORS.lightModeText}
              strokeWidth="2"></Path>
            <Path
              d="M3 6.5C3 5.09554 3 4.39331 3.33706 3.88886C3.48298 3.67048 3.67048 3.48298 3.88886 3.33706C4.39331 3 5.09554 3 6.5 3V3V3C7.90446 3 8.60669 3 9.11114 3.33706C9.32952 3.48298 9.51702 3.67048 9.66294 3.88886C10 4.39331 10 5.09554 10 6.5V6.5V6.5C10 7.90446 10 8.60669 9.66294 9.11114C9.51702 9.32952 9.32952 9.51702 9.11114 9.66294C8.60669 10 7.90446 10 6.5 10V10V10C5.09554 10 4.39331 10 3.88886 9.66294C3.67048 9.51702 3.48298 9.32952 3.33706 9.11114C3 8.60669 3 7.90446 3 6.5V6.5V6.5Z"
              stroke={theme ? COLORS.darkModeText : COLORS.lightModeText}
              strokeWidth="2"></Path>
            <Path
              d="M14 6.5H21"
              stroke={theme ? COLORS.darkModeText : COLORS.lightModeText}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"></Path>
            <Path
              d="M17.5 3V10"
              stroke={theme ? COLORS.darkModeText : COLORS.lightModeText}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"></Path>
          </G>
        </Svg>
      ) : name === 'wallet' ? (
        <Svg
          height={height}
          width={width}
          viewBox="0 0 24 24"
          fill={
            isActive
              ? theme
                ? COLORS.darkModeText
                : COLORS.lightModeText
              : 'transparent'
          }
          xmlns="http://www.w3.org/2000/svg">
          <G id="SVGRepo_iconCarrier">
            <Path
              fillRule="evenodd"
              clipRule="evenodd"
              //   fill={
              //     isActive
              //       ? theme
              //         ? COLORS.darkModeText
              //         : COLORS.lightModeText
              //       : 'transparent'
              //   }
              stroke={theme ? COLORS.darkModeText : COLORS.darkModeBackground}
              strokeWidth="2"
              d="M2.5192 7.82274C2 8.77128 2 9.91549 2 12.2039V13.725C2 17.6258 2 19.5763 3.17157 20.7881C4.34315 22 6.22876 22 10 22H14C17.7712 22 19.6569 22 20.8284 20.7881C22 19.5763 22 17.6258 22 13.725V12.2039C22 9.91549 22 8.77128 21.4808 7.82274C20.9616 6.87421 20.0131 6.28551 18.116 5.10812L16.116 3.86687C14.1106 2.62229 13.1079 2 12 2C10.8921 2 9.88939 2.62229 7.88403 3.86687L5.88403 5.10813C3.98695 6.28551 3.0384 6.87421 2.5192 7.82274Z"
            />
            <Path
              fill={
                isActive
                  ? theme
                    ? COLORS.darkModeBackground
                    : COLORS.darkModeText
                  : theme
                  ? COLORS.darkModeText
                  : COLORS.darkModeBackground
              }
              strokeWidth="2"
              d="M9 17.25C8.58579 17.25 8.25 17.5858 8.25 18C8.25 18.4142 8.58579 18.75 9 18.75H15C15.4142 18.75 15.75 18.4142 15.75 18C15.75 17.5858 15.4142 17.25 15 17.25H9Z"
            />
            {/* <Path
              fill-rule="evenodd"
              clip-rule="evenodd"
              stroke={
                isActive
                  ? theme
                    ? COLORS.darkModeBackground
                    : COLORS.lightModeText
                  : theme
                  ? COLORS.darkModeText
                  : COLORS.lightModeText
              }
              strokeWidth="2"
              d="M2.5192 7.82274C2 8.77128 2 9.91549 2 12.2039V13.725C2 17.6258 2 19.5763 3.17157 20.7881C4.34315 22 6.22876 22 10 22H14C17.7712 22 19.6569 22 20.8284 20.7881C22 19.5763 22 17.6258 22 13.725V12.2039C22 9.91549 22 8.77128 21.4808 7.82274C20.9616 6.87421 20.0131 6.28551 18.116 5.10812L16.116 3.86687C14.1106 2.62229 13.1079 2 12 2C10.8921 2 9.88939 2.62229 7.88403 3.86687L5.88403 5.10813C3.98695 6.28551 3.0384 6.87421 2.5192 7.82274ZM9 17.25C8.58579 17.25 8.25 17.5858 8.25 18C8.25 18.4142 8.58579 18.75 9 18.75H15C15.4142 18.75 15.75 18.4142 15.75 18C15.75 17.5858 15.4142 17.25 15 17.25H9Z"></Path> */}
          </G>
        </Svg>
      ) : name === 'moon' ? (
        <Svg
          height={height}
          width={width}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <G id="SVGRepo_iconCarrier">
            <Path
              d="M3.32031 11.6835C3.32031 16.6541 7.34975 20.6835 12.3203 20.6835C16.1075 20.6835 19.3483 18.3443 20.6768 15.032C19.6402 15.4486 18.5059 15.6834 17.3203 15.6834C12.3497 15.6834 8.32031 11.654 8.32031 6.68342C8.32031 5.50338 8.55165 4.36259 8.96453 3.32996C5.65605 4.66028 3.32031 7.89912 3.32031 11.6835Z"
              stroke={COLORS.lightModeText}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"></Path>
          </G>
        </Svg>
      ) : name === 'sun' ? (
        <Svg
          height={height}
          width={width}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <G id="SVGRepo_iconCarrier">
            <Path
              d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z"
              stroke={theme ? COLORS.darkModeText : COLORS.lightModeText}
              strokeWidth="2"></Path>
            <Path
              d="M12 5V3"
              stroke={theme ? COLORS.darkModeText : COLORS.lightModeText}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"></Path>
            <Path
              d="M17 7L19 5"
              stroke={theme ? COLORS.darkModeText : COLORS.lightModeText}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"></Path>
            <Path
              d="M19 12H21"
              stroke={theme ? COLORS.darkModeText : COLORS.lightModeText}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"></Path>
            <Path
              d="M17 17L19 19"
              stroke={theme ? COLORS.darkModeText : COLORS.lightModeText}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"></Path>
            <Path
              d="M12 19V21"
              stroke={theme ? COLORS.darkModeText : COLORS.lightModeText}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"></Path>
            <Path
              d="M7 17L5 19"
              stroke={theme ? COLORS.darkModeText : COLORS.lightModeText}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"></Path>
            <Path
              d="M5 12H3"
              stroke={theme ? COLORS.darkModeText : COLORS.lightModeText}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"></Path>
            <Path
              d="M5 5L7 7"
              stroke={theme ? COLORS.darkModeText : COLORS.lightModeText}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"></Path>
          </G>
        </Svg>
      ) : name === 'settings' ? (
        <Svg
          height={height}
          width={width}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <G id="SVGRepo_iconCarrier">
            <Path
              d="M14 5.28988H13C13 5.7323 13.2907 6.12213 13.7148 6.24833L14 5.28988ZM15.3302 5.84137L14.8538 6.72058C15.2429 6.93144 15.7243 6.86143 16.0373 6.54847L15.3302 5.84137ZM16.2426 4.92891L15.5355 4.2218V4.2218L16.2426 4.92891ZM17.6569 4.92891L16.9498 5.63601L16.9498 5.63602L17.6569 4.92891ZM19.0711 6.34312L19.7782 5.63602V5.63602L19.0711 6.34312ZM19.0711 7.75734L18.364 7.05023L19.0711 7.75734ZM18.1586 8.66978L17.4515 7.96268C17.1386 8.27563 17.0686 8.75709 17.2794 9.14621L18.1586 8.66978ZM18.7101 10L17.7517 10.2853C17.8779 10.7093 18.2677 11 18.7101 11V10ZM18.7101 14V13C18.2677 13 17.8779 13.2907 17.7517 13.7148L18.7101 14ZM18.1586 15.3302L17.2794 14.8538C17.0686 15.2429 17.1386 15.7244 17.4515 16.0373L18.1586 15.3302ZM19.0711 16.2427L19.7782 15.5356V15.5356L19.0711 16.2427ZM19.0711 17.6569L18.364 16.9498L18.364 16.9498L19.0711 17.6569ZM17.6569 19.0711L18.364 19.7782V19.7782L17.6569 19.0711ZM15.3302 18.1586L16.0373 17.4515C15.7243 17.1386 15.2429 17.0686 14.8538 17.2794L15.3302 18.1586ZM14 18.7101L13.7148 17.7517C13.2907 17.8779 13 18.2677 13 18.7101H14ZM10 18.7101H11C11 18.2677 10.7093 17.8779 10.2853 17.7517L10 18.7101ZM8.6698 18.1586L9.14623 17.2794C8.7571 17.0685 8.27565 17.1385 7.96269 17.4515L8.6698 18.1586ZM7.75736 19.071L7.05026 18.3639L7.05026 18.3639L7.75736 19.071ZM6.34315 19.071L5.63604 19.7782H5.63604L6.34315 19.071ZM4.92894 17.6568L4.22183 18.3639H4.22183L4.92894 17.6568ZM4.92894 16.2426L4.22183 15.5355H4.22183L4.92894 16.2426ZM5.84138 15.3302L6.54849 16.0373C6.86144 15.7243 6.93146 15.2429 6.7206 14.8537L5.84138 15.3302ZM5.28989 14L6.24835 13.7147C6.12215 13.2907 5.73231 13 5.28989 13V14ZM5.28989 10V11C5.73231 11 6.12215 10.7093 6.24835 10.2852L5.28989 10ZM5.84138 8.66982L6.7206 9.14625C6.93146 8.75712 6.86145 8.27567 6.54849 7.96272L5.84138 8.66982ZM4.92894 7.75738L4.22183 8.46449H4.22183L4.92894 7.75738ZM4.92894 6.34317L5.63605 7.05027H5.63605L4.92894 6.34317ZM6.34315 4.92895L7.05026 5.63606L7.05026 5.63606L6.34315 4.92895ZM7.75737 4.92895L8.46447 4.22185V4.22185L7.75737 4.92895ZM8.6698 5.84139L7.9627 6.54849C8.27565 6.86145 8.7571 6.93146 9.14623 6.7206L8.6698 5.84139ZM10 5.28988L10.2853 6.24833C10.7093 6.12213 11 5.7323 11 5.28988H10ZM11 2C9.89545 2 9.00002 2.89543 9.00002 4H11V4V2ZM13 2H11V4H13V2ZM15 4C15 2.89543 14.1046 2 13 2V4H15ZM15 5.28988V4H13V5.28988H15ZM15.8066 4.96215C15.3271 4.70233 14.8179 4.48994 14.2853 4.33143L13.7148 6.24833C14.1132 6.36691 14.4944 6.52587 14.8538 6.72058L15.8066 4.96215ZM15.5355 4.2218L14.6231 5.13426L16.0373 6.54847L16.9498 5.63602L15.5355 4.2218ZM18.364 4.2218C17.5829 3.44075 16.3166 3.44075 15.5355 4.2218L16.9498 5.63602V5.63601L18.364 4.2218ZM19.7782 5.63602L18.364 4.2218L16.9498 5.63602L18.364 7.05023L19.7782 5.63602ZM19.7782 8.46444C20.5592 7.68339 20.5592 6.41706 19.7782 5.63602L18.364 7.05023L18.364 7.05023L19.7782 8.46444ZM18.8657 9.37689L19.7782 8.46444L18.364 7.05023L17.4515 7.96268L18.8657 9.37689ZM19.6686 9.71475C19.5101 9.18211 19.2977 8.67285 19.0378 8.19335L17.2794 9.14621C17.4741 9.50555 17.6331 9.8868 17.7517 10.2853L19.6686 9.71475ZM18.7101 11H20V9H18.7101V11ZM20 11H22C22 9.89543 21.1046 9 20 9V11ZM20 11V13H22V11H20ZM20 13V15C21.1046 15 22 14.1046 22 13H20ZM20 13H18.7101V15H20V13ZM19.0378 15.8066C19.2977 15.3271 19.5101 14.8179 19.6686 14.2852L17.7517 13.7148C17.6331 14.1132 17.4741 14.4944 17.2794 14.8538L19.0378 15.8066ZM19.7782 15.5356L18.8657 14.6231L17.4515 16.0373L18.364 16.9498L19.7782 15.5356ZM19.7782 18.364C20.5592 17.5829 20.5592 16.3166 19.7782 15.5356L18.364 16.9498H18.364L19.7782 18.364ZM18.364 19.7782L19.7782 18.364L18.364 16.9498L16.9498 18.364L18.364 19.7782ZM15.5355 19.7782C16.3166 20.5592 17.5829 20.5592 18.364 19.7782L16.9498 18.364L15.5355 19.7782ZM14.6231 18.8657L15.5355 19.7782L16.9498 18.364L16.0373 17.4515L14.6231 18.8657ZM14.2853 19.6686C14.8179 19.5101 15.3271 19.2977 15.8066 19.0378L14.8538 17.2794C14.4944 17.4741 14.1132 17.6331 13.7148 17.7517L14.2853 19.6686ZM15 20V18.7101H13V20H15ZM13 22C14.1046 22 15 21.1046 15 20H13V22ZM11 22H13V20H11V22ZM9.00002 20C9.00002 21.1046 9.89545 22 11 22V20H9.00002ZM9.00002 18.7101V20H11V18.7101H9.00002ZM8.19337 19.0378C8.67287 19.2977 9.18213 19.5101 9.71477 19.6686L10.2853 17.7517C9.88681 17.6331 9.50557 17.4741 9.14623 17.2794L8.19337 19.0378ZM8.46447 19.7782L9.3769 18.8657L7.96269 17.4515L7.05026 18.3639L8.46447 19.7782ZM5.63604 19.7782C6.41709 20.5592 7.68342 20.5592 8.46447 19.7781L7.05026 18.3639L5.63604 19.7782ZM4.22183 18.3639L5.63604 19.7782L7.05026 18.3639L5.63604 16.9497L4.22183 18.3639ZM4.22183 15.5355C3.44078 16.3166 3.44078 17.5829 4.22183 18.3639L5.63604 16.9497V16.9497L4.22183 15.5355ZM5.13427 14.6231L4.22183 15.5355L5.63604 16.9497L6.54849 16.0373L5.13427 14.6231ZM4.33144 14.2852C4.48996 14.8179 4.70234 15.3271 4.96217 15.8066L6.7206 14.8537C6.52589 14.4944 6.36693 14.1132 6.24835 13.7147L4.33144 14.2852ZM5.28989 13H4V15H5.28989V13ZM4 13H4H2C2 14.1046 2.89543 15 4 15V13ZM4 13V11H2V13H4ZM4 11V9C2.89543 9 2 9.89543 2 11H4ZM4 11H5.28989V9H4V11ZM4.96217 8.1934C4.70235 8.67288 4.48996 9.18213 4.33144 9.71475L6.24835 10.2852C6.36693 9.88681 6.52589 9.50558 6.7206 9.14625L4.96217 8.1934ZM4.22183 8.46449L5.13428 9.37693L6.54849 7.96272L5.63605 7.05027L4.22183 8.46449ZM4.22183 5.63606C3.44078 6.41711 3.44079 7.68344 4.22183 8.46449L5.63605 7.05027L5.63605 7.05027L4.22183 5.63606ZM5.63605 4.22185L4.22183 5.63606L5.63605 7.05027L7.05026 5.63606L5.63605 4.22185ZM8.46447 4.22185C7.68343 3.4408 6.4171 3.4408 5.63605 4.22185L7.05026 5.63606V5.63606L8.46447 4.22185ZM9.37691 5.13428L8.46447 4.22185L7.05026 5.63606L7.9627 6.54849L9.37691 5.13428ZM9.71477 4.33143C9.18213 4.48995 8.67287 4.70234 8.19337 4.96218L9.14623 6.7206C9.50557 6.52588 9.88681 6.36692 10.2853 6.24833L9.71477 4.33143ZM9.00002 4V5.28988H11V4H9.00002Z"
              fill={theme ? COLORS.darkModeText : COLORS.lightModeText}></Path>
            <Circle
              cx="12"
              cy="12"
              r="3"
              stroke={theme ? COLORS.darkModeText : COLORS.lightModeText}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"></Circle>
          </G>
        </Svg>
      ) : name === 'shield' ? (
        <Svg
          width={width}
          height={height}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <G id="SVGRepo_bGCarrier" strokeWidth="0"></G>
          <G
            id="SVGRepo_tracerCarrier"
            strokeLinecap="round"
            strokeLinejoin="round"></G>
          <G id="SVGRepo_iconCarrier">
            <Path
              d="M3 10.4167C3 7.21907 3 5.62028 3.37752 5.08241C3.75503 4.54454 5.25832 4.02996 8.26491 3.00079L8.83772 2.80472C10.405 2.26824 11.1886 2 12 2C12.8114 2 13.595 2.26824 15.1623 2.80472L15.7351 3.00079C18.7417 4.02996 20.245 4.54454 20.6225 5.08241C21 5.62028 21 7.21907 21 10.4167C21 10.8996 21 11.4234 21 11.9914C21 17.6294 16.761 20.3655 14.1014 21.5273C13.38 21.8424 13.0193 22 12 22C10.9807 22 10.62 21.8424 9.89856 21.5273C7.23896 20.3655 3 17.6294 3 11.9914C3 11.4234 3 10.8996 3 10.4167Z"
              stroke={theme ? COLORS.darkModeText : COLORS.lightModeText}
              strokeWidth="1.5"></Path>
            <Circle
              cx="12"
              cy="9"
              r="2"
              stroke={theme ? COLORS.darkModeText : COLORS.lightModeText}
              strokeWidth="1"></Circle>
            <Path
              d="M16 15C16 16.1046 16 17 12 17C8 17 8 16.1046 8 15C8 13.8954 9.79086 13 12 13C14.2091 13 16 13.8954 16 15Z"
              stroke={theme ? COLORS.darkModeText : COLORS.lightModeText}
              strokeWidth="1"></Path>
          </G>
        </Svg>
      ) : name === 'bitcoinB' ? (
        <Svg
          width={width}
          height={height}
          viewBox="0 0 29 41"
          fill={color}
          xmlns="http://www.w3.org/2000/svg">
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8.81818 0C9.92275 0 10.8182 0.89543 10.8182 2V4.625H15.9091V2C15.9091 0.89543 16.8045 0 17.9091 0C19.0137 0 19.9091 0.89543 19.9091 2V4.85515C23.8349 5.77583 26.7273 9.34825 26.7273 13.5625C26.7273 15.8781 25.8541 17.9999 24.416 19.5944C27.1568 21.1181 29 24.0732 29 27.4375C29 32.3408 25.0846 36.375 20.1818 36.375H19.9091V39C19.9091 40.1046 19.0137 41 17.9091 41C16.8045 41 15.9091 40.1046 15.9091 39V36.375H10.8182V39C10.8182 40.1046 9.92275 41 8.81818 41C7.71361 41 6.81818 40.1046 6.81818 39V36.375H2C0.89543 36.375 0 35.4796 0 34.375C0 33.2704 0.89543 32.375 2 32.375H4.54545V8.625H2C0.89543 8.625 0 7.72957 0 6.625C0 5.52043 0.89543 4.625 2 4.625H6.81818V2C6.81818 0.89543 7.71361 0 8.81818 0ZM8.54545 8.625V18.5H17.9091C20.5376 18.5 22.7273 16.3224 22.7273 13.5625C22.7273 10.8027 20.5376 8.625 17.9091 8.625H8.54545ZM8.54545 22.5V32.375H20.1818C22.8104 32.375 25 30.1974 25 27.4375C25 24.6776 22.8104 22.5 20.1818 22.5H8.54545Z"
            fill={color}
          />
        </Svg>
      ) : name === 'contactsIcon' ? (
        <Svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <G id="SVGRepo_iconCarrier">
            <Path
              d="M21 8L17.4392 9.97822C15.454 11.0811 14.4614 11.6326 13.4102 11.8488C12.4798 12.0401 11.5202 12.0401 10.5898 11.8488C9.53864 11.6326 8.54603 11.0811 6.5608 9.97822L3 8M6.2 19H17.8C18.9201 19 19.4802 19 19.908 18.782C20.2843 18.5903 20.5903 18.2843 20.782 17.908C21 17.4802 21 16.9201 21 15.8V8.2C21 7.0799 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V15.8C3 16.9201 3 17.4802 3.21799 17.908C3.40973 18.2843 3.71569 18.5903 4.09202 18.782C4.51984 19 5.07989 19 6.2 19Z"
              stroke={color}
              strokeWidth="1.5"></Path>
          </G>
        </Svg>
      ) : name === 'expirementalFeaturesIcon' ? (
        <Svg
          width={width}
          height={height}
          viewBox="0 0 57 57"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <Path
            d="M23.1532 5.92361L43.1286 17.3847M23.1532 5.92361L21.168 4.75M23.1532 5.92361L14.7246 20.472M43.1286 17.3847L37.7673 26.6387M43.1286 17.3847L45.125 18.5339M37.7673 26.6387L33.6979 33.6628M37.7673 26.6387L31.692 23.1432M33.6979 33.6628L29.8089 40.3757M33.6979 33.6628L23.716 27.9195M29.8089 40.3757L26.2575 46.5056C23.075 51.9987 16.0266 53.8809 10.5143 50.7093C5.00211 47.5378 3.11346 40.5137 6.29596 35.0206L9.38562 29.6875M29.8089 40.3757L23.6037 36.8056"
            stroke="#0078FF"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <Path
            d="M52.25 35.4273C52.25 38.16 50.1234 40.3752 47.5 40.3752C44.8766 40.3752 42.75 38.16 42.75 35.4273C42.75 33.7176 44.6096 31.4354 46.0016 29.9667C46.8257 29.097 48.1743 29.097 48.9984 29.9667C50.3904 31.4354 52.25 33.7176 52.25 35.4273Z"
            stroke="#0078FF"
            strokeWidth="4"
          />
        </Svg>
      ) : name === 'posICON' ? (
        <Svg
          width={width}
          height={height}
          viewBox="0 0 66 88"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <Path
            d="M54.9333 3H11.2C6.67126 3 3 6.67126 3 11.2V76.8C3 81.3287 6.67126 85 11.2 85H54.9333C59.462 85 63.1333 81.3287 63.1333 76.8V11.2C63.1333 6.67126 59.462 3 54.9333 3Z"
            stroke="#0078FF"
            strokeWidth="5"
          />
          <Path
            d="M52.2 13.9336H13.9333V41.2669H52.2V13.9336Z"
            stroke="#0078FF"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <Path
            d="M13.9333 74.0664H19.4"
            stroke="#0078FF"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M46.7334 74.0664H52.2001"
            stroke="#0078FF"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M30.3333 74.0664H35.7999"
            stroke="#0078FF"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M13.9333 63.1338H19.4"
            stroke="#0078FF"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M46.7334 63.1338H52.2001"
            stroke="#0078FF"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M30.3333 63.1338H35.7999"
            stroke="#0078FF"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M13.9333 52.2002H19.4"
            stroke="#0078FF"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M46.7334 52.2002H52.2001"
            stroke="#0078FF"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M30.3333 52.2002H35.7999"
            stroke="#0078FF"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ) : name === 'arrow' ? (
        <Svg
          width={width}
          height={height}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <Path
            d="M12 18V6M12 6L7 11M12 6L17 11"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ) : name === 'cancelIcon' ? (
        <Svg
          fill={'#e20000'}
          height={height}
          width={width}
          version="1.1"
          id="Layer_1"
          xmlns="http://www.w3.org/2000/svg"
          // xmlns:xlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 300.003 300.003"
          // xml:space="preserve"
          stroke={'#e20000'}>
          <G id="SVGRepo_bgCarrier" stroke-width="0" />

          <G
            id="SVGRepo_tracerCarrier"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <G id="SVGRepo_iconCarrier">
            <G>
              <G>
                <Path d="M150,0C67.159,0,0.001,67.159,0.001,150c0,82.838,67.157,150.003,149.997,150.003S300.002,232.838,300.002,150 C300.002,67.159,232.839,0,150,0z M206.584,207.171c-5.989,5.984-15.691,5.984-21.675,0l-34.132-34.132l-35.686,35.686 c-5.986,5.984-15.689,5.984-21.672,0c-5.989-5.991-5.989-15.691,0-21.68l35.683-35.683L95.878,118.14 c-5.984-5.991-5.984-15.691,0-21.678c5.986-5.986,15.691-5.986,21.678,0l33.222,33.222l31.671-31.673 c5.986-5.984,15.694-5.986,21.675,0c5.989,5.991,5.989,15.697,0,21.678l-31.668,31.671l34.13,34.132 C212.57,191.475,212.573,201.183,206.584,207.171z" />
              </G>
            </G>
          </G>
        </Svg>
      ) : name === 'pauseIcon' ? (
        <Svg
          width={width}
          height={height}
          fill={color}
          viewBox="0 0 32 32"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          stroke={color}>
          <G id="SVGRepo_bgCarrier" stroke-width="0"></G>
          <G
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"></G>
          <G id="SVGRepo_iconCarrier">
            <Path d="M5.92 24.096q0 0.832 0.576 1.408t1.44 0.608h4.032q0.832 0 1.44-0.608t0.576-1.408v-16.16q0-0.832-0.576-1.44t-1.44-0.576h-4.032q-0.832 0-1.44 0.576t-0.576 1.44v16.16zM18.016 24.096q0 0.832 0.608 1.408t1.408 0.608h4.032q0.832 0 1.44-0.608t0.576-1.408v-16.16q0-0.832-0.576-1.44t-1.44-0.576h-4.032q-0.832 0-1.408 0.576t-0.608 1.44v16.16z"></Path>
          </G>
        </Svg>
      ) : name === 'playIcon' ? (
        <Svg
          width={width}
          height={height}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          stroke={color}>
          <G id="SVGRepo_bgCarrier" stroke-width="0"></G>
          <G
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"></G>
          <G id="SVGRepo_iconCarrier">
            <Path
              d="M21.4086 9.35258C23.5305 10.5065 23.5305 13.4935 21.4086 14.6474L8.59662 21.6145C6.53435 22.736 4 21.2763 4 18.9671L4 5.0329C4 2.72368 6.53435 1.26402 8.59661 2.38548L21.4086 9.35258Z"
              fill={color}></Path>
          </G>
        </Svg>
      ) : name === 'expandedTxCheck' ? (
        <Svg
          width={width}
          height={height}
          viewBox="0 0 59 46"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <Path
            d="M18.4091 36.1791L6.30732 23.9322C4.9562 22.5649 2.74835 22.5649 1.39722 23.9322C0.0686773 25.2767 0.0686775 27.4397 1.39722 28.7842L18.4091 46L57.6028 6.33641C58.9313 4.99194 58.9313 2.82896 57.6028 1.48448C56.2517 0.117157 54.0438 0.117158 52.6927 1.48448L18.4091 36.1791Z"
            fill={color}
          />
        </Svg>
      ) : name === 'expandedTxClose' ? (
        <Svg
          width={width}
          height={width}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg">
          <Path
            d="M18 6L6 18"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <Path
            d="M6 6L18 18"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </Svg>
      ) : (
        <View></View>
      )}
    </>
  );
}
