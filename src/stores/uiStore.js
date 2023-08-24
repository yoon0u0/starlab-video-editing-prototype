import { makeAutoObservable } from "mobx";

const ZOOM_PERCENTAGES = [15, 25, 30, 50, 60, 70, 80, 100, 125, 150, 200];

class UIStore {
    // Session Info
    accountId = "test";
    projectId = "test";
    windowSize = {
        width: window.innerWidth,
        height: window.innerHeight,
    };

    canvasSize = {
        width: (window.innerWidth / 3) * 2, // 2/3
        height: (window.innerHeight / 3) * 2, // 2/3
    };
    canvasControls = {
        scalePos: 4,
        transformerNodeIds: [],
		opacity: 1,
		opacityAuthor: null,
    };
    canvasConst = {
        margin: 2,
		minWidth: 10,
		minHeight: 10,
    };

    timelineSize = {
        width: (window.innerWidth / 3) * 2, // 2/3
        height: window.innerWidth / 3, // 1/3
    };
    timelineControls = {
        numberOfRows: 3,
        pxPerSec: 10,
        playPosition: 0, //secs
        isPlaying: false,
        intervalId: -1,

        positionIndicatorVisibility: 0,
        positionIndicatorSec: 0,

        selectedTimelineItems: [],

        splitting: false,
		rangeSelectingTimeline: false,
		rangeSelectingFirstPx: -1,
    };
    timelineConst = {
        labelHeight: 20,
        linePadding: 1,

        positionIndicatorWidth: 8,
        labelIntervalPx: 100, //px

        trackHandlerWidth: 20, //px

        trackMaxDuration: 60 * 20, //seconds
        trackMinDuration: 0, //seconds
        delay: 0.1,

        positionIndicatorId: "position_indicator",
        positionIndicatorLabelId: "position_indicator_label",
        minTimelineItemWidthPx: 120,

        timelineLabelsId: "timeline_labels",
    };

    objectNames = {
        //video: "video",
        image: "image",
        text: "text",
		shape: "shape",
		cut: "cut",
		zoom: "zoom",
		crop: "crop",
		blur: "blur",
    };
    backgroundName = "bg";

	editColorPalette = {
		"text": "#F6BD60",
		"image": "#F5A7A6",
		"shape": "#b19bbd",
		"cut": "#abc7ff",
		"zoom": "#A8D0C6",
		"crop": "#DAF283",
		"blur": "#b0e3ff",
		"": "lightgray",
	}

    labelColorPalette = {
        // high-level type
        greeting: "#DAF283",
        overview: "#F6BD60 ",
        step: "#F5A7A6",
        supplementary: "#b19bbd",
        explanation: "#b0e3ff",
        description: "#A8D0C6",
        conclusion: "#abc7ff",
        misc: "lightgray",

        Greeting: "#DAF283",
        Overview: "#F6BD60 ",
        Step: "#F5A7A6",
        Supplementary: "#b19bbd",
        Explanation: "#b0e3ff",
        Description: "#A8D0C6",
        Conclusion: "#abc7ff",
        "Misc.": "lightgray",

        // low-level type
        //greeting
        opening: "#DAF283",
        //overview
        goal: "#F6BD60",
        motivation: "#F6BD60",
        briefing: "#F6BD60",
        //step
        subgoal: "#F5A7A6 ",
        instruction: "#F5A7A6",
        tool: "#F5A7A6",
        "tool (multiple)": "#F5A7A6",
        "tool (optional)": "#F5A7A6",
        //supplementary
        warning: "#b19bbd",
        tip: "#b19bbd",
        //explanation
        justification: "#b0e3ff",
        effect: "#b0e3ff",
        //description
        status: "#A8D0C6",
        context: "#A8D0C6",
        "tool spec.": "#A8D0C6",
        //greeting-outro
        closing: "#DAF283",
        //conclusion
        outcome: "#abc7ff",
        reflection: "#abc7ff",
        //misc
        "side note": "lightgray",
        "self-promo": "lightgray",
        bridge: "lightgray",
        filler: "lightgray",

        "tool-spec": "#A8D0C6",
        "side-note": "lightgray",
    };

    // panelSize = {};

    constructor(rootStore) {
        makeAutoObservable(this, {}, { autoBind: true });
        this.rootStore = rootStore;
    }

    get canvasScale() {
        return ZOOM_PERCENTAGES[this.canvasControls.scalePos] / 100;
    }
    get canvasZoom() {
        return ZOOM_PERCENTAGES[this.canvasControls.scalePos];
    }

    get timelineSingleLineHeight() {
        return this.timelineSize.height / this.timelineControls.numberOfRows;
    }

    get trackWidthPx() {
        return this.timelineConst.trackMaxDuration * this.timelineControls.pxPerSec;
    }

	resetTempState() {
		this.canvasControls.transformerNodeIds = [];
		this.timelineControls.selectedTimelineItems = [];
		this.timelineControls.splitting = false;
		this.timelineControls.rangeSelectingTimeline = false;
		this.timelineControls.rangeSelectingFirstPx = -1;
		this.timelineControls.positionIndicatorVisibility = 0;
	}

    setWindowSize({ width, height }) {
        this.windowSize = { width, height };
        this.canvasSize = {
            width: width / 7 * 3,
            height: height / 2,
        };
        this.timelineSize = {
            width: width / 7 * 3,
            height: 80 * this.rootStore.domainStore.projectMetadata.trackCnt,
        };
    }

    secToPx(seconds) {
        return seconds * this.timelineControls.pxPerSec;
    }

    pxToSec(px) {
        return Math.round((px / this.timelineControls.pxPerSec) * 100) / 100;
	}

	removeSelectedCanvasObject(objectId) {
		this.canvasControls.transformerNodeIds = 
			this.canvasControls.transformerNodeIds.filter((id) => id !== objectId);
	}

	addSelectedCanvasObject(objectId) {
		if (this.canvasControls.transformerNodeIds.includes(objectId)) {
			return;
		}
		this.canvasControls.transformerNodeIds = [
			...this.canvasControls.transformerNodeIds,
			objectId,
		];
	}

	selectCanvasObjects(objects) {
		const objectIds = objects.map((object) => object.id());
		const curIntent = this.rootStore.domainStore.curIntent;
		
		let selectedTimelineItems = [];
		let selectedNodeIds = [];

		for (const id of objectIds) {
			const object = curIntent.getCanvasObjectById(id);
			if (object !== undefined) {
				if (selectedTimelineItems.findIndex((obj) => obj.commonState.id === object.commonState.id) === -1) {
					selectedTimelineItems.push(object);
				}
				else {
					if (curIntent.editOperationKey === this.objectNames.crop) {
						if (id.substring(0, 2) === "bg") {
							continue;
						}
						if (id.substring(0, 2) === "fg") {
							selectedNodeIds = selectedNodeIds.filter((nodeId) => nodeId !== "bg_" + id.substring(3));
						}
					}
				}
			}
			selectedNodeIds.push(id);
		}
		this.canvasControls.transformerNodeIds = selectedNodeIds;
		this.timelineControls.selectedTimelineItems = selectedTimelineItems;
	}

	selectTimelineObjects(objects) {
		this.timelineControls.selectedTimelineItems = objects;
		const curIntent = this.rootStore.domainStore.curIntent;
		if (objects.length === 1) {
			const object = objects[0];
			if (curIntent.editOperationKey === this.objectNames.crop) {
				this.canvasControls.transformerNodeIds = ["fg_" + object.commonState.id];
			}
			else {
				this.canvasControls.transformerNodeIds = [object.commonState.id];
			}
			return;
		}
		this.canvasControls.transformerNodeIds = [];
	}
}

export default UIStore;
