type NeedRefreshHandler = () => void;

let needRefreshHandler: NeedRefreshHandler | null = null;

export function setCabinetSwNeedRefreshHandler(handler: NeedRefreshHandler | null): void {
  needRefreshHandler = handler;
}

export function notifyCabinetSwNeedRefresh(): void {
  needRefreshHandler?.();
}
