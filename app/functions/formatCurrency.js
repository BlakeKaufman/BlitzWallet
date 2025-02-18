export const formatCurrency = ({amount, code}) => {
  const commaFormatted = String(amount).replace(
    /(\d)(?=(\d{3})+(?!\d))/g,
    '$1 ',
  );
  const periodFormatted = String(amount)
    .replace('.', ',')
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ');

  const switchOptions = {
    // united arab emirates dirham (ex: AED 1,234.56)
    AED: [`د.إ ${commaFormatted}`, `${commaFormatted}`, 'د.إ'],

    // Afghanistan Afghani (using comma formatting)
    AFN: [`؋ ${commaFormatted}`, `${commaFormatted}`, '؋'],

    // Albania Lek (using comma formatting)
    ALL: [`Lek ${commaFormatted}`, `${commaFormatted}`, 'Lek'],

    // Armenia Dram (using comma formatting)
    AMD: [`֏${commaFormatted}`, `${commaFormatted}`, '֏'],

    // Netherlands Antilles Guilder (ex: ANG 1,234.56)
    ANG: [`ƒ ${commaFormatted}`, `${commaFormatted}`, 'ƒ'],

    // Angola Kwanza (using comma formatting)
    AOA: [`Kz ${commaFormatted}`, `${commaFormatted}`, 'Kz'],

    // argentine peso (ex: $ 1.234,56)
    ARS: [`$ ${periodFormatted}`, `${periodFormatted}`, '$'],

    // australian dollar (ex: $ 1,234.56)
    AUD: [`$ ${commaFormatted}`, `${commaFormatted}`, '$'],

    // Aruba Guilder (using comma formatting)
    AWG: [`ƒ${commaFormatted}`, `${commaFormatted}`, 'ƒ'],

    // Azerbaijan Manat (using comma formatting)
    AZN: [`₼${commaFormatted}`, `${commaFormatted}`, '₼'],

    // bosnia and herzegovina convertible mark (ex: KM 1.234,56)
    BAM: [`KM ${commaFormatted}`, `${commaFormatted}`, 'KM'],

    // barbadian Dollar (ex: $1.234,56)
    BBD: [`$${commaFormatted}`, `${commaFormatted}`, '$'],

    // Bangladesh Taka (using comma formatting)
    BDT: [`৳${commaFormatted}`, `${commaFormatted}`, '৳'],

    // Bahrain Dinar (using comma formatting)
    BHD: [`BD ${commaFormatted}`, `${commaFormatted}`, 'BD'],

    // Burundi Franc (using comma formatting)
    BIF: [`FBu ${commaFormatted}`, `${commaFormatted}`, 'FBu'],

    // Bermuda Dollar (using comma formatting)
    BMD: [`$${commaFormatted}`, `${commaFormatted}`, '$'],

    // Brunei Darussalam Dollar (using comma formatting)
    BND: [`$${commaFormatted}`, `${commaFormatted}`, '$'],

    // bolivian Boliviano (ex: $b 1.234,56)
    BOB: [`$b ${commaFormatted}`, `${commaFormatted}`, '$b'],

    // Brazilian Real (ex: R$ 1.234,56)
    BRL: [`R$ ${periodFormatted}`, `${periodFormatted}`, 'R$'],

    // Bhutan Ngultrum (using comma formatting)
    BTN: [`Nu.${commaFormatted}`, `${commaFormatted}`, 'Nu.'],

    // Botswana Pula (using comma formatting)
    BWP: [`P${commaFormatted}`, `${commaFormatted}`, 'P'],

    // Belarus Ruble (using comma formatting)
    BYN: [`Br${commaFormatted}`, `${commaFormatted}`, 'Br'],

    // Belize Dollar (using comma formatting)
    BZD: [`$${commaFormatted}`, `${commaFormatted}`, '$'],

    // bulgarian lev (ex: лв1,234.56)
    BGN: [`лв${commaFormatted}`, `${commaFormatted}`, 'лв'],

    // bahamian Dollar (ex: $1,234,56)
    BSD: [`$${commaFormatted}`, `${commaFormatted}`, '$'],

    // canadian dollar (ex: $ 1,234.56)
    CAD: [`$ ${commaFormatted}`, `${commaFormatted}`, '$'],

    // swiss franc (ex: fr. 1.234,56)
    CHF: [`fr. ${periodFormatted}`, `${periodFormatted}`, 'fr.'],

    // chilean peso (ex: $ 1,234.56)
    CLP: [`$ ${commaFormatted}`, `${commaFormatted}`, '$'],

    // yuan renminbi (ex: ¥ 1,234.56)
    CNY: [`¥ ${commaFormatted}`, `${commaFormatted}`, '¥'],

    // colombian peso (ex: $ 1,234.56)
    COP: [`$ ${commaFormatted}`, `${commaFormatted}`, '$'],

    // costa rican colón (ex: ₡1.234,56)
    CRC: [`₡${periodFormatted}`, `${periodFormatted}`, '₡'],

    // czech koruna (ex: 1.234,56 Kč)
    CZK: [`${periodFormatted} Kč`, `${periodFormatted}`, 'Kč'],

    // danish krone (ex: kr. 1.234,56)
    DKK: [`kr. ${periodFormatted}`, `${periodFormatted}`, 'kr.'],

    // dominican Peso (ex: RD$ 1,234.56)
    DOP: [`RD$ ${commaFormatted}`, `${commaFormatted}`, 'RD$'],

    // european union (ex: €1.234,56)
    EUR: [`€${periodFormatted}`, `${periodFormatted}`, '€'],

    // uk/great britain pound sterling (ex: £1,234.56)
    GBP: [`£${commaFormatted}`, `${commaFormatted}`, '£'],

    // georgian lari (ex: ₾1,234.56)
    GEL: [`₾${commaFormatted}`, `${commaFormatted}`, '₾'],

    // guatemalan quetzal (ex: Q1,234.56)
    GTQ: [`Q${commaFormatted}`, `${commaFormatted}`, 'Q'],

    // hong kong dollar (ex: HK$ 1,234.56)
    HKD: [`HK$ ${commaFormatted}`, `${commaFormatted}`, 'HK$'],

    // honduran lempira (ex: L 1,234.56)
    HNL: [`L ${commaFormatted}`, `${commaFormatted}`, 'L'],

    // croatian kuna (ex: 1,234.56 kn)
    HRK: [`${commaFormatted} kn`, `${commaFormatted}`, 'kn'],

    // hungarian forint (ex: 1.234,56 Ft)
    HUF: [`${periodFormatted} Ft`, `${periodFormatted}`, 'Ft'],

    // indonesian rupiah (ex: Rp 1,234.56)
    IDR: [`Rp ${commaFormatted}`, `${commaFormatted}`, 'Rp'],

    // new israeli shekel (ex: ₪ 1.234,56)
    ILS: [`₪ ${periodFormatted}`, `${periodFormatted}`, '₪'],

    // indian rupee (ex: ₹ 1,234.56)
    INR: [`₹ ${commaFormatted}`, `${commaFormatted}`, '₹'],

    // icelandic krona (ex: kr. 1.234,56)
    ISK: [`kr. ${periodFormatted}`, `${periodFormatted}`, 'kr.'],

    // jamaican dollar (ex: J$ 1,234.56)
    JMD: [`J$ ${commaFormatted}`, `${commaFormatted}`, 'J$'],

    // yen (ex: ¥ 1,234.56)
    JPY: [`¥ ${commaFormatted}`, `${commaFormatted}`, '¥'],

    KES: [`KSh ${commaFormatted}`, `${commaFormatted}`, 'KSh'],

    LBP: [`L£ ${commaFormatted}`, `${commaFormatted}`, 'L£'],

    // won (ex: ₩ 1,234.56)
    KRW: [`₩ ${commaFormatted}`, `${commaFormatted}`, '₩'],

    // moroccan dirham (ex: 1,234.56 .د.م.)
    MAD: [`${commaFormatted} .د.م.`, `${commaFormatted}`, '.د.م.'],

    // moldovan leu (ex: 1.234,56 L)
    MDL: [`${commaFormatted} L`, `${commaFormatted}`, 'L'],

    // mexican peso (ex: $ 1,234.56)
    MXN: [`$ ${commaFormatted}`, `${commaFormatted}`, '$'],

    // malaysian ringgit (ex: RM 1,234.56)
    MYR: [`RM ${commaFormatted}`, `${commaFormatted}`, 'RM'],

    NAD: [`$${commaFormatted}`, `${commaFormatted}`, '$'],

    // nigerian naira (ex: ₦1,234.56)
    NGN: [`₦${commaFormatted}`, `${commaFormatted}`, '₦'],

    // nicaraguan Córdoba (ex: C$ 1,234.56)
    NIO: [`C$ ${commaFormatted}`, `${commaFormatted}`, 'C$'],

    // norwegian krone (ex: kr 1,234.56)
    NOK: [`kr ${commaFormatted}`, `${commaFormatted}`, 'kr'],

    // new zealand dollar (ex: $ 1,234.56)
    NZD: [`$ ${commaFormatted}`, `${commaFormatted}`, '$'],

    // panamanian balboa (ex: B/. 1,234.56)
    PAB: [`B/. ${commaFormatted}`, `${commaFormatted}`, 'B/.'],

    PEN: [`S/. ${commaFormatted}`, `${commaFormatted}`, 'S/.'],
    PGK: [`K ${commaFormatted}`, `${commaFormatted}`, 'K'],
    PHP: [`₱ ${commaFormatted}`, `${commaFormatted}`, '₱'],
    PKR: [`Rs ${commaFormatted}`, `${commaFormatted}`, 'Rs'],
    PLN: [`${periodFormatted} zł`, `${periodFormatted}`, 'zł'],
    PYG: [`₲${commaFormatted}`, `${commaFormatted}`, '₲'],
    QAR: [`QR ${commaFormatted}`, `${commaFormatted}`, 'QR'],
    RON: [`${commaFormatted}L`, `${commaFormatted}`, 'L'],
    RSD: [`${commaFormatted} Дин.`, `${commaFormatted}`, 'Дин.'],
    RUB: [`${periodFormatted} ₽`, `${periodFormatted}`, '₽'],
    RWF: [`RF ${commaFormatted}`, `${commaFormatted}`, 'RF'],
    SAR: [`${commaFormatted} ﷼`, `${commaFormatted}`, '﷼'],
    SBD: [`$${commaFormatted}`, `${commaFormatted}`, '$'],
    SCR: [`Rs ${commaFormatted}`, `${commaFormatted}`, 'Rs'],
    SDG: [`£ ${commaFormatted}`, `${commaFormatted}`, '£'],
    SEK: [`${periodFormatted} kr`, `${periodFormatted}`, 'kr'],
    SGD: [`$${commaFormatted}`, `${commaFormatted}`, '$'],
    SHP: [`£${commaFormatted}`, `${commaFormatted}`, '£'],
    SLL: [`Le ${commaFormatted}`, `${commaFormatted}`, 'Le'],
    SOS: [`Sh ${commaFormatted}`, `${commaFormatted}`, 'Sh'],
    SPL: [`${commaFormatted} SPL`, `${commaFormatted}`, 'SPL'],
    SRD: [`$${commaFormatted}`, `${commaFormatted}`, '$'],
    STN: [`Db ${commaFormatted}`, `${commaFormatted}`, 'Db'],
    SVC: [`₡${commaFormatted}`, `${commaFormatted}`, '₡'],
    SYP: [`£S ${commaFormatted}`, `${commaFormatted}`, '£S'],
    SZL: [`L ${commaFormatted}`, `${commaFormatted}`, 'L'],
    THB: [`${commaFormatted} ฿`, `${commaFormatted}`, '฿'],
    TJS: [`SM ${commaFormatted}`, `${commaFormatted}`, 'SM'],
    TMT: [`m ${commaFormatted}`, `${commaFormatted}`, 'm'],
    TND: [`DT ${commaFormatted}`, `${commaFormatted}`, 'DT'],
    TOP: [`T$ ${commaFormatted}`, `${commaFormatted}`, 'T$'],
    TRY: [`${commaFormatted} ₺`, `${commaFormatted}`, '₺'],
    TTD: [`$${commaFormatted}`, `${commaFormatted}`, '$'],
    TVD: [`$${commaFormatted}`, `${commaFormatted}`, '$'],
    TWD: [`元 ${commaFormatted}`, `${commaFormatted}`, '元'],
    TZS: [`Sh ${commaFormatted}`, `${commaFormatted}`, 'Sh'],
    UAH: [`₴${commaFormatted}`, `${commaFormatted}`, '₴'],
    UGX: [`Sh ${commaFormatted}`, `${commaFormatted}`, 'Sh'],
    USD: [`$${commaFormatted}`, `${commaFormatted}`, '$'],
    UYU: [`$U${periodFormatted}`, `${periodFormatted}`, '$U'],
    UZS: [`so'm ${commaFormatted}`, `${commaFormatted}`, `so'm`],
    VEF: [`Bs ${commaFormatted}`, `${commaFormatted}`, 'Bs'],
    VES: [`Bs ${commaFormatted}`, `${commaFormatted}`, 'Bs'],
    VND: [`${periodFormatted} ₫`, `${periodFormatted}`, '₫'],
    VUV: [`VT ${commaFormatted}`, `${commaFormatted}`, 'VT'],
    WST: [`WS$ ${commaFormatted}`, `${commaFormatted}`, 'WS$'],
    XAF: [`FCFA ${commaFormatted}`, `${commaFormatted}`, 'FCFA'],
    XCD: [`$${commaFormatted}`, `${commaFormatted}`, '$'],
    XDR: [`SDR ${commaFormatted}`, `${commaFormatted}`, 'SDR'],
    XOF: [`CFA ${commaFormatted}`, `${commaFormatted}`, 'CFA'],
    XPF: [`F ${commaFormatted}`, `${commaFormatted}`, 'F'],
    YER: [`﷼ ${commaFormatted}`, `${commaFormatted}`, '﷼'],
    ZAR: [`R ${commaFormatted}`, `${commaFormatted}`, 'R'],
    ZMW: [`K ${commaFormatted}`, `${commaFormatted}`, 'K'],
    ZWD: [`$${commaFormatted}`, `${commaFormatted}`, '$'],

    // Existing code remains the same, adding these to the switchOptions object:
    // default
    DEFAULT: [amount.toString(), amount.toString(), ''],
  };

  return switchOptions[code] || switchOptions.DEFAULT;
};
