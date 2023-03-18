import React from "react";

import useRootContext from "../../hooks/useRootContext";
import { playPositionToFormat } from "../../utilities/timelineUtilities";

function PositionIndicator({ showLabel, playPosition, className = "" }) {
    const { uiStore } = useRootContext();

    const height = uiStore.timelineSize.height;
    const positionIndicatorWidth = uiStore.timelineConst.positionIndicatorWidth;

    return (
        <div className={className}>
            {showLabel ? (
                <label
                    className="absolute z-30 bg-violet-800 text-white text-xs"
                    style={{
                        left: positionIndicatorWidth,
                    }}
                    htmlFor="position_indicator_button"
                >
                    {" "}
                    {playPositionToFormat(playPosition)}{" "}
                </label>
            ) : null}
            <button
                className="absolute left-0"
                type="button"
                id="position_indicator_button"
                style={{
                    width: positionIndicatorWidth,
                    height: height,
                }}
            >
                <div
                    className="mx-auto"
                    style={{
                        width: 2,
                        height: height,
                        background: "black",
                    }}
                />
            </button>
        </div>
    );
}

export default PositionIndicator;
