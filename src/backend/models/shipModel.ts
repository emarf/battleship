type ShipSizeType = 'small' | 'medium' | 'large' | 'huge';

export type Ship = {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  type: ShipSizeType;
  length: number;
};