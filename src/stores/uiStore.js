import { makeAutoObservable } from "mobx";
import { roundNumber } from "../utilities/genericUtilities";

const ZOOM_PERCENTAGES = [15, 25, 30, 50, 60, 70, 80, 100, 125, 150, 200];

class UIStore {
    // Session Info
    accountId = "test";
    projectId = "test";
    windowSize = {
        width: window.innerWidth,
        height: window.innerHeight,
    };

	navigation = "timeline";

	chatConst = {
		maxHeight: (window.innerHeight / 3) * 2,
		editPreviewWidth: 280,
		editPreviewHeight: 200,
	}

	commandSpaceControls = {
		requestingAmbiguousParts: false,
		viewPortStart: 0,
		viewPortFinish: 0,
		viewPortAuthor: null,
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
		zoomAuthor: null,
		transformerKeepRatioAuthor: null,

		sketching: false,
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
        numberOfRows: 1,
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

        trackHandlerWidth: 0, //px

        trackMaxDuration: 60 * 5, //seconds
        trackMinDuration: 0, //seconds
        delay: 0.1,

        positionIndicatorId: "position_indicator",
        positionIndicatorLabelId: "position_indicator_label",
        minTimelineItemWidthPx: 120,
		minTimelineItemDuration: 0.5,
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

	// editColorPalette = {
	// 	"text": "#c45161",
	// 	"image": "#e094a0",
	// 	"shape": "#f2b6c0",
	// 	"cut": "#c7522a",
	// 	"zoom": "#74a892",
	// 	"crop": "#8db7d2",
	// 	"blur": "#5e62a9",
	// 	"": "#434279",
	// };

	editColorPalette = {
		"text": "#000000",
		"image": "#000000",
		"shape": "#000000",
		"cut": "#000000",
		"zoom": "#000000",
		"crop": "#000000",
		"blur": "#000000",
		"": "#000000",
	};

	referenceTypeColorPalette = {
		temporal: "rgba(255, 193, 7, 0.5)",
		spatial: "rgba(0, 255, 42, 0.5)",
		custom: "rgba(3, 169, 244, 0.5)",
		edit: "rgba(244, 67, 54, 0.5)",
	};

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

	resetAll() {
		this.canvasControls ={
			scalePos: 4,
			transformerNodeIds: [],
			opacity: 1,
			opacityAuthor: null,
			zoomAuthor: null,
	
			sketching: false,
		}
		this.timelineControls = {
			numberOfRows: 1,
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
		this.timelineConst.trackMaxDuration = 60 * 5;
	}

	resetTempState() {
		this.canvasControls.transformerNodeIds = [];
		this.canvasControls.sketching = false;
		this.timelineControls.selectedTimelineItems = [];
		this.timelineControls.splitting = false;
		this.timelineControls.rangeSelectingTimeline = false;
		this.timelineControls.rangeSelectingFirstPx = -1;
		this.timelineControls.positionIndicatorVisibility = 0;
	}

    setWindowSize({ width, height }) {
        this.windowSize = { width, height };
        this.canvasSize = {
            width: width / 2,
            height: height / 3,
        };
        this.timelineSize = {
            width: width / 2 - 10,
            height: 80 * this.rootStore.domainStore.projectMetadata.trackCnt,
        };
		this.timelineControls.pxPerSec = this.adaptZoomValue(0);
    }

    secToPx(seconds) {
        return seconds * this.timelineControls.pxPerSec;
    }

    pxToSec(px) {
        return Math.round((px / this.timelineControls.pxPerSec) * 100) / 100;
	}

	adaptZoomValue(value) {
		const scale = value / 100 * value / 100;
		const trackMaxDuration = this.timelineConst.trackMaxDuration;
		const width = this.timelineSize.width;
		const minPxToSec = width / trackMaxDuration;
		const maxPxToSec = width / 60;
		return scale * (maxPxToSec - minPxToSec) + minPxToSec
	}
	adaptPxPerSec(pxPerSec) {
		const trackMaxDuration = this.timelineConst.trackMaxDuration;
		const width = this.timelineSize.width;
		const minPxToSec = width / trackMaxDuration;
		const maxPxToSec = width / 60;
		const scale = (pxPerSec - minPxToSec) / (maxPxToSec - minPxToSec)
		return Math.round(Math.sqrt(scale) * 100);
	};

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
		const curTab = this.rootStore.domainStore.curTab;
		const edits = objectIds.map((id) => curTab.getCanvasObjectById(id));

		const onlySuggested = edits.some((edit) => {
			if (edit === undefined) {
				return false;
			}
			return edit.isSuggested;
		});
		
		let selectedTimelineItems = [];
		let selectedNodeIds = [];

		for (const id of objectIds) {
			const edit = curTab.getCanvasObjectById(id);
			if (edit !== undefined) {
				if (onlySuggested && edit.isSuggested === false) {
					continue;
				}
				if (selectedTimelineItems.findIndex((obj) => obj.commonState.id === edit.commonState.id) === -1) {
					selectedTimelineItems.push(edit);
				}
				else {
					if (curTab.editOperationKey === this.objectNames.crop) {
						if (id.substring(0, 2) === "bg") {
							continue;
						}
						if (id.substring(0, 2) === "fg") {
							selectedNodeIds = selectedNodeIds.filter((nodeId) => nodeId !== "bg_" + id.substring(3));
						}
					}
				}
				selectedNodeIds.push(id);
			}
		}
		this.canvasControls.transformerNodeIds = selectedNodeIds;
		this.timelineControls.selectedTimelineItems = selectedTimelineItems;
	}

	selectTimelineObjects(objects) {
		this.timelineControls.selectedTimelineItems = objects;
		const curTab = this.rootStore.domainStore.curTab;
		if (objects.length === 1) {
			const object = objects[0];
			if (curTab.editOperationKey === this.objectNames.crop) {
				this.canvasControls.transformerNodeIds = ["fg_" + object.commonState.id];
			}
			else {
				this.canvasControls.transformerNodeIds = [object.commonState.id];
			}
			return;
		}
		this.canvasControls.transformerNodeIds = [];
	}

	setNavigation(navigation) {
		if (navigation !== "timeline" && navigation !== "transcript") {
			return;
		}
		this.navigation = navigation;
	}

	logData(msg, data) {
		//console.log(msg, data);
		this.rootStore.logData(msg, data);
	}
}

export default UIStore;
