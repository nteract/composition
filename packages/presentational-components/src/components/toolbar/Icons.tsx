import React from "react";

export const Collapse = ({ className }: { className?: string }) => (
  <svg
    width="25px"
    height="25px"
    viewBox="0 0 25 25"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g id="SVG-Layer" transform="translate(0.500000, 0.500000)">
        <polyline
          stroke="#22a6f1"
          strokeLinecap="round"
          strokeLinejoin="round"
          points="14 11.5 12 9.5 10 11.5"
        ></polyline>
        <polyline
          stroke="#22a6f1"
          strokeLinecap="round"
          strokeLinejoin="round"
          points="14 14.5 12 12.5 10 14.5"
        ></polyline>
      </g>
    </g>
  </svg>
);

export const Expand = () => <Collapse className="toolbar-icon-flip" />;

export const ExpandSidebar = ({
  isSidebarVisible,
}: {
  isSidebarVisible?: boolean;
}) =>
  isSidebarVisible ? (
    <svg
      width="16"
      height="22"
      viewBox="0 0 16 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 0H12C14.2091 0 16 1.79086 16 4V18C16 20.2091 14.2091 22 12 22H0V0Z"
        fill="#E2E5E7"
      />
      <rect
        width="5"
        height="1"
        rx="0.5"
        transform="matrix(-1 0 0 1 12 8)"
        fill="#29313A"
      />
      <rect
        width="5"
        height="1"
        rx="0.5"
        transform="matrix(-1 0 0 1 12 10)"
        fill="#29313A"
      />
      <rect
        width="5"
        height="1"
        rx="0.5"
        transform="matrix(-1 0 0 1 12 12)"
        fill="#29313A"
      />
      <path
        d="M2.85729 10.2856L4.62138 9.22717C4.78801 9.1272 5 9.24722 5 9.44155L5 11.5585C5 11.7528 4.78801 11.8728 4.62138 11.7728L2.85729 10.7144C2.69545 10.6173 2.69545 10.3827 2.85729 10.2856Z"
        fill="#29313A"
      />
    </svg>
  ) : (
    <svg
      width="16px"
      height="24px"
      viewBox="0 0 16 24"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Group</title>
      <g
        id="Page-1"
        stroke="none"
        strokeWidth="1"
        fill="none"
        fillRule="evenodd"
      >
        <g id="Group">
          <path
            d="M12,0 C14.209139,-4.05812251e-16 16,1.790861 16,4 L16,20 C16,22.209139 14.209139,24 12,24 L0,24 L0,0 L12,0 Z"
            id="Combined-Shape"
            fill="#E2E5E7"
          ></path>
          <g
            id="Group-6"
            transform="translate(4.000000, 10.000000)"
            fill="#29313A"
            fillRule="nonzero"
          >
            <rect x="0" y="0" width="5" height="1" rx="0.5"></rect>
            <rect x="0" y="2" width="5" height="1" rx="0.5"></rect>
            <rect x="0" y="4" width="5" height="1" rx="0.5"></rect>
            <path d="M9.1427,2.28563 L7.3786,1.22717 C7.212,1.1272 7,1.24722 7,1.44155 L7,3.55845 C7,3.75278 7.212,3.8728 7.3786,3.77283 L9.1427,2.71437 C9.3045,2.61727 9.3045,2.38273 9.1427,2.28563 Z"></path>
          </g>
        </g>
      </g>
    </svg>
  );

export const Clear = () => (
  <svg
    width="24px"
    height="24px"
    viewBox="0 0 24 24"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Group 4</title>
    <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g id="Group-4">
        <line
          x1="15.5"
          y1="13.5"
          x2="18.5"
          y2="13.5"
          stroke="#22a6f1"
          strokeLinecap="round"
          strokeLinejoin="bevel"
        ></line>
        <line
          x1="14.5"
          y1="11.5"
          x2="18.5"
          y2="11.5"
          stroke="#22a6f1"
          strokeLinecap="round"
          strokeLinejoin="bevel"
        ></line>
        <line
          x1="15.5"
          y1="9.5"
          x2="18.5"
          y2="9.5"
          stroke="#22a6f1"
          strokeLinecap="round"
          strokeLinejoin="bevel"
        ></line>
        <path
          d="M9.165,11.0698 C10.026,10.5137 10.984,10.125 12,10.0001 C12,10.0001 11.646,10.7967 11.608,11.9803 C11.323,11.9491 10.989,11.8924 10.64,11.7949 C10.112,11.647 9.591,11.4165 9.165,11.0698 Z M8.339,11.6765 C6.222,13.4292 4.876,16.1465 5,18.0001 L7.948,18.0001 C7.605,17.2117 7.537,16.424 7.567,15.7939 C7.587,15.3713 7.651,15.0114 7.711,14.7556 C7.741,14.6274 7.77,14.5245 7.792,14.4518 C7.803,14.4155 7.812,14.3867 7.819,14.366 L7.828,14.3411 L7.83,14.3333 L7.831,14.3306 L7.832,14.3296 L7.832,14.3292 C7.832,14.329 7.832,14.3288 8.302,14.4999 C8.772,14.6711 8.772,14.6709 8.772,14.6708 L8.772,14.6714 L8.767,14.6838 C8.763,14.6959 8.757,14.7157 8.749,14.7426 C8.732,14.7963 8.709,14.8779 8.685,14.9826 C8.636,15.1926 8.583,15.4915 8.566,15.8415 C8.535,16.4829 8.629,17.2684 9.071,18.0001 L11.241,18.0001 C10.83,17.6235 10.552,17.2219 10.365,16.8487 C10.185,16.4886 10.094,16.1626 10.048,15.9226 C10.025,15.8024 10.013,15.7031 10.007,15.6309 C10.004,15.5947 10.002,15.5653 10.001,15.5432 C10.001,15.5322 10,15.5231 10,15.5158 L10,15.5065 L10,15.5029 L10,15.5014 L10,15.5007 C10,15.5004 10,15.5001 10.5,15.5001 C11,15.5001 11,15.4998 11,15.4995 L11,15.4989 L11,15.498 L11,15.4966 L11,15.4958 L11,15.5023 C11.001,15.51 11.001,15.5245 11.003,15.545 C11.007,15.5861 11.014,15.6508 11.03,15.7338 C11.062,15.9 11.127,16.1365 11.26,16.4015 C11.513,16.908 12.027,17.5488 13.099,18.0001 L15,18.0001 C12.659,16.361 11.852,14.5027 11.657,12.9899 C11.278,12.9568 10.831,12.8866 10.371,12.7579 C9.697,12.5692 8.946,12.2405 8.339,11.6765 Z"
          id="Shape"
          fill="#22a6f1"
        ></path>
        <line
          x1="11.376"
          y1="10.7986"
          x2="16.5"
          y2="5.67474"
          stroke="#22a6f1"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></line>
      </g>
    </g>
  </svg>
);

export const Commands = () => (
  <svg
    width="22px"
    height="25px"
    viewBox="0 0 22 25"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Group</title>
    <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g id="Group" transform="translate(0.000000, 0.292248)">
        <path
          d="M0,20.5077525 L3.96,22.7077525 L11,18.7077525 L18.04,22.7077525 L22,20.5077525 L22,6.8677525 L11.977,1.2549925 C11.37,0.9150025 10.63,0.9150025 10.023,1.2549925 L0,6.8677525 L0,20.5077525 Z"
          fill="#22a6f1"
          fillRule="nonzero"
        ></path>
        <polygon
          fill="#22a6f1"
          fillRule="nonzero"
          points="10.998 12.0560525 5 9.0572525 10.998 5.7077525 16.995 9.0572525"
        ></polygon>
        <polygon
          fill="#22a6f1"
          fillRule="nonzero"
          points="5 9.0587625 10.998 12.0529525 10.998 18.4066525 5 15.4078525"
        ></polygon>
        <polygon
          fill="#22a6f1"
          fillRule="nonzero"
          points="16.995 9.0587625 10.997 12.0529525 10.997 18.4066525 16.995 15.4078525"
        ></polygon>
        <path
          d="M10.998,18.4021525 L10.998,12.0437525 M10.998,12.0437525 L5,9.0542525 M10.998,12.0437525 L17,9.0542525"
          id="Shape"
          stroke="#22a6f1"
          strokeWidth="1.5"
        ></path>
      </g>
    </g>
  </svg>
);

export const Group = () => (
  <svg
    width="165"
    height="24"
    viewBox="0 0 165 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="36" width="24" height="24" rx="4" fill="#E2E5E7" />
    <path
      d="M52.1317 11.4573L45.9792 7.612C45.5529 7.34558 45 7.65204 45 8.15472V15.8453C45 16.348 45.5529 16.6544 45.9792 16.388L52.1316 12.5427C52.5327 12.2921 52.5327 11.7079 52.1317 11.4573Z"
      fill="#29313A"
      stroke="#29313A"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect x="72" width="24" height="24" rx="4" fill="#E2E5E7" />
    <path
      d="M81 15H82V9H81V15Z"
      fill="#29313A"
      stroke="#29313A"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M86 15H87V9H86V15Z"
      fill="#29313A"
      stroke="#29313A"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect x="105" width="24" height="24" rx="4" fill="#E2E5E7" />
    <path
      d="M120.5 13.5H123.5"
      stroke="#29313A"
      strokeLinecap="round"
      strokeLinejoin="bevel"
    />
    <path
      d="M119.5 11.5H123.5"
      stroke="#29313A"
      strokeLinecap="round"
      strokeLinejoin="bevel"
    />
    <path
      d="M120.5 9.5H123.5"
      stroke="#29313A"
      strokeLinecap="round"
      strokeLinejoin="bevel"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M114.165 11.0698C115.026 10.5137 115.984 10.125 117 10.0001C117 10.0001 116.646 10.7967 116.608 11.9803C116.323 11.9491 115.989 11.8924 115.64 11.7949C115.112 11.647 114.591 11.4165 114.165 11.0698ZM113.339 11.6765C111.222 13.4292 109.876 16.1465 110 18.0001H112.948C112.605 17.2117 112.537 16.424 112.567 15.7939C112.587 15.3713 112.651 15.0114 112.711 14.7556C112.741 14.6274 112.77 14.5245 112.792 14.4518C112.803 14.4155 112.812 14.3867 112.819 14.366L112.828 14.3411L112.83 14.3333L112.831 14.3306L112.832 14.3296L112.832 14.3292C112.832 14.329 112.832 14.3288 113.302 14.4999C113.772 14.6711 113.772 14.6709 113.772 14.6708L113.772 14.6714L113.767 14.6838C113.763 14.6959 113.757 14.7157 113.749 14.7426C113.732 14.7963 113.709 14.8779 113.685 14.9826C113.636 15.1926 113.583 15.4915 113.566 15.8415C113.535 16.4829 113.629 17.2684 114.071 18.0001H116.241C115.83 17.6235 115.552 17.2219 115.365 16.8487C115.185 16.4886 115.094 16.1626 115.048 15.9226C115.025 15.8024 115.013 15.7031 115.007 15.6309C115.004 15.5947 115.002 15.5653 115.001 15.5432C115.001 15.5322 115 15.5231 115 15.5158L115 15.5065L115 15.5029L115 15.5014L115 15.5007C115 15.5004 115 15.5001 115.5 15.5001C116 15.5001 116 15.4998 116 15.4995L116 15.4989L116 15.498L116 15.4966L116 15.4958L116 15.5023C116.001 15.51 116.001 15.5245 116.003 15.545C116.007 15.5861 116.014 15.6508 116.03 15.7338C116.062 15.9 116.127 16.1365 116.26 16.4015C116.513 16.908 117.027 17.5488 118.099 18.0001H120C117.659 16.361 116.852 14.5027 116.657 12.9899C116.278 12.9568 115.831 12.8866 115.371 12.7579C114.697 12.5692 113.946 12.2405 113.339 11.6765Z"
      fill="#29313A"
    />
    <path
      d="M116.376 10.7986L121.5 5.67474"
      stroke="#29313A"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect width="24" height="24" rx="4" fill="#E2E5E7" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 8V16V8Z"
      fill="#29313A"
    />
    <path
      d="M12 8V16"
      stroke="#29313A"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 12H16H8Z"
      fill="#29313A"
    />
    <path
      d="M8 12H16"
      stroke="#29313A"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M142 20.8L145.96 23L153 19L160.04 23L164 20.8V7.16L153.977 1.54724C153.37 1.20725 152.63 1.20725 152.023 1.54724L142 7.16V20.8Z"
      fill="#E2E5E7"
    />
    <path
      d="M152.998 12.3483L147 9.3495L152.998 6L158.995 9.3495L152.998 12.3483Z"
      fill="#8F969D"
    />
    <path
      d="M147 9.35101L152.998 12.3452V18.6989L147 15.7001V9.35101Z"
      fill="#29313A"
    />
    <path
      d="M158.995 9.35101L152.997 12.3452V18.6989L158.995 15.7001V9.35101Z"
      fill="#BABFC4"
    />
    <path
      d="M152.998 18.6944V12.336M152.998 12.336L147 9.3465M152.998 12.336L159 9.3465"
      stroke="#E2E5E7"
      strokeWidth="1.5"
    />
  </svg>
);

export const Pause = () => (
  <svg
    width="24px"
    height="24px"
    viewBox="0 0 24 24"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Group 3</title>
    <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g id="Group-3" fillRule="nonzero">
        <polygon
          stroke="#22a6f1"
          strokeWidth="2"
          fill="#22a6f1"
          strokeLinecap="round"
          strokeLinejoin="round"
          points="9 15 10 15 10 9 9 9"
        ></polygon>
        <polygon
          stroke="#22a6f1"
          strokeWidth="2"
          fill="#22a6f1"
          strokeLinecap="round"
          strokeLinejoin="round"
          points="14 15 15 15 15 9 14 9"
        ></polygon>
      </g>
    </g>
  </svg>
);

export const Play = () => (
  <svg
    width="24px"
    height="24px"
    viewBox="0 0 24 24"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Group 2</title>
    <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g id="Group-2" fillRule="nonzero">
        <path
          d="M16.1317,11.4573 L9.9792,7.612 C9.5529,7.34558 9,7.65204 9,8.15472 L9,15.8453 C9,16.348 9.5529,16.6544 9.9792,16.388 L16.1316,12.5427 C16.5327,12.2921 16.5327,11.7079 16.1317,11.4573 Z"
          stroke="#22a6f1"
          fill="#22a6f1"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
      </g>
    </g>
  </svg>
);

export const Plus = () => (
  <svg
    width="24px"
    height="24px"
    viewBox="0 0 24 24"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Group 5</title>
    <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g id="Group-5">
        <path d="M12,8 L12,16 L12,8 Z" fill="#22a6f1"></path>
        <line
          x1="12"
          y1="8"
          x2="12"
          y2="16"
          stroke="#22a6f1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></line>
        <path d="M8,12 L16,12 L8,12 Z" fill="#22a6f1"></path>
        <line
          x1="8"
          y1="12"
          x2="16"
          y2="12"
          stroke="#22a6f1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></line>
      </g>
    </g>
  </svg>
);
