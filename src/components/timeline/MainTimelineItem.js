import React from "react";

import { observer } from "mobx-react-lite";
import { action } from "mobx";

import { useDraggable } from "@dnd-kit/core";

import TimelineItem from "./TimelineItem";

import useRootContext from "../../hooks/useRootContext";
import {
    playPositionToFormat,
} from "../../utilities/timelineUtilities";

const MainTimelineItem = observer(function MainTimelineItem({ mainScene, mainScenes, scenes }) {
    const { uiStore, domainStore } = useRootContext();

    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: mainScene.commonState.id,
        data: {
            type: "scene",
            scene: mainScene,
        },
        disabled: true,
    });

	const onTimelineItemClick = action((event) => {
        event.stopPropagation();
        event.preventDefault();

        if (uiStore.timelineControls.splitting) {
            return;
        }

		if (uiStore.timelineControls.rangeSelectingTimeline) {
			const labelsDiv = document.getElementById(uiStore.timelineConst.timelineLabelsId);
            const timelineRect = labelsDiv.getBoundingClientRect();
            let offsetPx =
                event.clientX -
                timelineRect.left +
                labelsDiv.scrollLeft -
                uiStore.timelineConst.trackHandlerWidth;
			const offset = uiStore.pxToSec(offsetPx);
			let finish = Math.min(offset + 10, uiStore.timelineConst.trackMaxDuration);
			for (let scene of scenes) {
				if (offset >= scene.commonState.offset && offset < scene.commonState.end) {
					alert("intersects with existing edit");
					return;
				}
				if (offset < scene.commonState.offset) {
					finish = Math.min(finish, scene.commonState.offset);
				}
			}
			domainStore.curIntent.addActiveEdit(offset, finish);
			uiStore.timelineControls.rangeSelectingTimeline = false;
			uiStore.timelineControls.rangeSelectingFirstPx = -1;
			uiStore.timelineControls.positionIndicatorVisibility -= 1;

			// const first = uiStore.timelineControls.rangeSelectingFirstPx;
			// if (first === -1) {
			// 	uiStore.timelineControls.rangeSelectingFirstPx = offsetPx;
			// }
			// else {
			// 	const second = offsetPx;
			// 	// create editState between "first" and "second"
			// 	domainStore.curIntent.addActiveEdit(uiStore.pxToSec(first), uiStore.pxToSec(second));
			// 	uiStore.timelineControls.rangeSelectingTimeline = false;
			// 	uiStore.timelineControls.rangeSelectingFirstPx = -1;
			// 	uiStore.timelineControls.positionIndicatorVisibility -= 1;
			// }
            return;
		}
    });

    const onTimelineItemMouseEnter = action((event) => {
        if (uiStore.timelineControls.rangeSelectingTimeline
		) {
            uiStore.timelineControls.positionIndicatorVisibility += 1;
        }
    });

    const onTimelineItemMouseLeave = action((event) => {
        if (uiStore.timelineControls.rangeSelectingTimeline	
		) {
            uiStore.timelineControls.positionIndicatorVisibility -= 1;
        }
    });

    const onTimelineItemMouseMove = (event) => {
        event.stopPropagation();
        event.preventDefault();

        if (uiStore.timelineControls.rangeSelectingTimeline) {
            const labelsDiv = document.getElementById(uiStore.timelineConst.timelineLabelsId);
            const timelineRect = labelsDiv.getBoundingClientRect();

            const positionIndicatorDiv = document.getElementById(
                uiStore.timelineConst.positionIndicatorId
            );
            const positionIndicatorLabelDiv = document.getElementById(
                uiStore.timelineConst.positionIndicatorLabelId
            );
            //const videoElement = document.getElementById("video_element_" + mainScene.commonState.id);

            let offsetPx =
                event.clientX -
                timelineRect.left +
                labelsDiv.scrollLeft -
                uiStore.timelineConst.trackHandlerWidth;

            const offset = uiStore.pxToSec(offsetPx);
            if (positionIndicatorDiv) {
                positionIndicatorDiv.style.transform = `translate3d(${offsetPx}px, ${0}px, ${0}px)`;
            }
            if (positionIndicatorLabelDiv) {
                positionIndicatorLabelDiv.innerHTML = playPositionToFormat(offset);
            }
        } else {
            return;
        }
    };

    let adjustedTransform = {
        ...transform,
    };

    return (
        <TimelineItem
            id={mainScene.commonState.id}
            ref={setNodeRef}
			itemType={"main"}
            scene={mainScene}
            scenes={mainScenes}
            transform={adjustedTransform}
            onClick={onTimelineItemClick}
            onMouseMove={onTimelineItemMouseMove}
            onMouseEnter={onTimelineItemMouseEnter}
            onMouseLeave={onTimelineItemMouseLeave}
            attributes={attributes}
            listeners={listeners}
        />
    );
});

export default MainTimelineItem;
