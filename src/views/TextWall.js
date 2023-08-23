import React, { useState } from "react";

import { observer } from "mobx-react-lite";
import { action } from "mobx";

import useRootContext from "../hooks/useRootContext";
import { playPositionToFormat } from "../utilities/timelineUtilities";
import { DndContext, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToFirstScrollableAncestor } from "@dnd-kit/modifiers";
import TrimHandlerLeftIcon from "../icons/TrimHandlerLeftIcon";
import TrimHandlerRightIcon from "../icons/TrimHandlerRightIcon";

const DraggableHandle = observer(function DraggableHandle({ edit, isLeftHandler, isOverlay }) {
	const { uiStore } = useRootContext();
	const limit = isLeftHandler ? edit.leftTimelineLimit : edit.rightTimelineLimit;
	const { attributes, listeners, setNodeRef } = useDraggable({
        id: isOverlay ? `overlay-script-${isLeftHandler ? "left" : "right"}-${edit.commonState.id}`
			: `script-${isLeftHandler ? "left" : "right"}-${edit.commonState.id}`,
		data: {
            type: "script",
            edit,
			isLeftHandler,
			limit,
        },
        disabled: false,
    });

	const handlerClassName = "z-30 text-s";
	return <div
		ref={setNodeRef}
		className={handlerClassName}
		style={{
			height: "100%",
			// width: `${handlerWidth}px`,
			//transform: CSS.Transform.toString(adjustedTransform),
			opacity: isOverlay ? 0.5 : 1,
			backgroundColor: "grey",
		}}
		{...listeners} {...attributes}
	> 
		<button className="my-auto">
			{" "} {isLeftHandler ? <TrimHandlerLeftIcon /> : <TrimHandlerRightIcon />}{" "}
		</button>
	</div>
});

const SentenceBox = observer(function SentenceBox({ 
	index,
	item,
	isTimeSelected,
	activeEdits,
	skippedParts,
}) {
    const { uiStore, domainStore } = useRootContext();

	const {
        setNodeRef,
    } = useDroppable({
        id: `droppable-script-${index}`,
        data: {
            type: "script",
            item,
        },
		disabled: false,
    });

	const [showTime, setShowTime] = useState(false);

	const handleClick = action((event) => {
		event.preventDefault();
		event.stopPropagation();
		if (uiStore.timelineControls.rangeSelectingTimeline === true) {
			let offset = item.start;
			let finish = item.finish;
			for (let edit of activeEdits) {
				if (edit.commonState.offset > offset) {
					finish = Math.min(finish, edit.commonState.offset);
				}
				else {
					offset = Math.max(offset, edit.commonState.end);
				}
			}
			if (finish <= offset) {
				alert("intersects with exsiting edit");
				return;
			}
			domainStore.curIntent.addActiveEdit(offset, finish);
			uiStore.timelineControls.rangeSelectingTimeline = false;
			uiStore.timelineControls.rangeSelectingFirstPx = -1;
		}
		else {
			uiStore.timelineControls.playPosition = item.start;
		}
    });

	const onMouseEnter = action(() => {
		setShowTime(true);
	});


	const onMouseLeave = action(() => {
		setShowTime(false);
	});

	const outerClassName = "relative pr-2 my-1" + (
		isTimeSelected ? " bg-red-400" : "");

	const timeClassName = "z-30 absolute -top-2 text-xs text-black";

	const formattedStart = playPositionToFormat(item.start);
	//const formattedFinish = playPositionToFormat(item.finish);

    return (
		<div
			ref={setNodeRef}
			id={"script-" + index}
			className={outerClassName}
			onClick={(event) => handleClick(event)}
			onMouseEnter={(event) => onMouseEnter()}
			onMouseLeave={(event) => onMouseLeave()}
		>	
			<div>
				<div className="relative z-10 text-left">
					{item.text}
				</div>	
			</div>
			{skippedParts.map((skipped, idx) => {
				let start = Math.max(item.start, skipped.commonState.offset);
				let finish = Math.min(item.finish, skipped.commonState.end);
				const left = Math.round((start - item.start) / (item.finish - item.start) * 100);
				const width = Math.floor((finish - start) / (item.finish - item.start) * 100);
				const isLeftEnd = (item.start <= skipped.commonState.offset && item.finish > skipped.commonState.offset);
				const isRightEnd = (item.start < skipped.commonState.end && item.finish >= skipped.commonState.end);
				let innerClassName = "z-0 absolute inset-y-0 bg-gray-500 flex";
				if (isLeftEnd && isRightEnd) {
					innerClassName += " justify-between";
				}
				else if (isRightEnd) {
					innerClassName += " justify-end";
				}
				else if (isLeftEnd) {
					innerClassName += " justify-start";
				}
				return(<div
					key={`skipped-${index}-${skipped.commonState.id}`}
					id={`skipped-${index}-${skipped.commonState.id}`}
				>
					<div
						className={innerClassName}
						style={{
							marginLeft: `${left}%`,
							width: `${width}%`,
							opacity: 1, 
						}}
					> 
					</div>
				</div>);
			})}
			{activeEdits.map((edit, idx) => {
				let start = Math.max(item.start, edit.commonState.offset);
				let finish = Math.min(item.finish, edit.commonState.end);
				const left = Math.round((start - item.start) / (item.finish - item.start) * 100);
				const width = Math.floor((finish - start) / (item.finish - item.start) * 100);
				const isLeftEnd = (item.start <= edit.commonState.offset && item.finish > edit.commonState.offset);
				const isRightEnd = (item.start < edit.commonState.end && item.finish >= edit.commonState.end);
				let innerClassName = "z-20 inset-y-0 absolute flex";
				if (isLeftEnd && isRightEnd) {
					innerClassName += " justify-between";
				}
				else if (isRightEnd) {
					innerClassName += " justify-end";
				}
				else if (isLeftEnd) {
					innerClassName += " justify-start";
				}
				return(<div
					key={`script-${index}-${edit.commonState.id}`}
					id={`script-${index}-${edit.commonState.id}`}
				>
					<div
						className={innerClassName}
						style={{
							backgroundColor: uiStore.editColorPalette[edit.intent.editOperationKey],
							marginLeft: `${left}%`,
							width: `${width}%`,
							opacity: 0.4, 
						}}
						//onClick={(event) => handleEditClick(event, edit)}
					> 
						{isLeftEnd ?
							<DraggableHandle 
								edit={edit} 
								isLeftHandler={true}
								isOverlay={false}
							/>
							: null
						}
						{isRightEnd ?
							<DraggableHandle
								edit={edit} 
								isLeftHandler={false}
								isOverlay={false}
							/>
							: null
						}
					</div>
				</div>);
			})}
			{showTime ? (<div className={timeClassName}> {formattedStart} </div>) : null }
		</div>
    );
});

const TextWall = observer(function TextWall() {
    const { uiStore, domainStore } = useRootContext();
    const filteredScript = domainStore.transcripts;
	const selectedIndex = domainStore.transcriptSelectedIndex;

	const activeEdits = domainStore.curIntent.activeEdits; 
	const skippedParts = domainStore.skippedParts;

	const [activeHandler, setActiveHandler] = useState(null);

	const onHandlerDragStart = action((event) => {
		const { active } = event;
		setActiveHandler(active);
		return;
	});

	const onHandlerDragEnd = action((event) => {
		const { over } = event;
		const active = activeHandler;
		if (active === null || over === null) {
			return;
		}
		const item = over.data.current.item;
		const edit = active.data.current.edit;
		const isLeftHandler = active.data.current.isLeftHandler;
		const limit = active.data.current.limit;
		if (isLeftHandler) {
			const updatedStart = Math.max(limit, Math.min(item.start, edit.commonState.finish));
			edit.commonState.offset = updatedStart;
			edit.commonState.start = updatedStart;
		}
		else {
			const updatedFinish = Math.min(limit, Math.max(item.finish, edit.commonState.offset))
			edit.commonState.finish = updatedFinish;	
		}
		setActiveHandler(null);
		return;
	});

	const onHandlerDragMove = action((event) => {
		const { over } = event;
		const active = activeHandler;
		if (active === null || over === null) {
			return;
		}
		const item = over.data.current.item;
		const edit = active.data.current.edit;
		const isLeftHandler = active.data.current.isLeftHandler;
		const limit = active.data.current.limit;
		if (isLeftHandler) {
			const updatedStart = Math.max(limit, Math.min(item.start, edit.commonState.finish));
			edit.commonState.offset = updatedStart;
			edit.commonState.start = updatedStart;
		}
		else {
			const updatedFinish = Math.min(limit, Math.max(item.finish, edit.commonState.offset))
			edit.commonState.finish = updatedFinish;	
		}
		return;
    });

    return (
        <div 
			className="overflow-y-scroll overflow-x-visible disable-select p-10"
			style={{
                height: uiStore.windowSize.height / 3 * 2
			}}
		>
			<DndContext
				sensors={useSensors(
                    useSensor(PointerSensor)
                )}
				modifiers={[restrictToFirstScrollableAncestor]}
				onDragStart={onHandlerDragStart}
				onDragEnd={onHandlerDragEnd}
				onDragMove={onHandlerDragMove}
			>
				{filteredScript.length === 0 ? (
					<div className="text-red"> No Script... </div>
				) : (
					<div className="flex flex-wrap ">
						{filteredScript.map((item, index) => {
							const isTimeSelected = selectedIndex === index;
							const isEditSelected = false;
							const relevantActiveEdits = activeEdits.filter((edit) => {
								return (
									(edit.commonState.offset >= item.start && edit.commonState.offset < item.finish)
									|| (edit.commonState.end > item.start && edit.commonState.end < item.finish)
									|| (edit.commonState.offset < item.start && edit.commonState.end >= item.finish)
								);
							});
							const relevantSkippedParts = skippedParts.filter((skipped) => {
								return (
									(skipped.commonState.offset >= item.start && skipped.commonState.offset < item.finish)
									|| (skipped.commonState.end > item.start && skipped.commonState.end < item.finish)
									|| (skipped.commonState.offset < item.start && skipped.commonState.end >= item.finish)
								);
							});
							return (<SentenceBox 
								key={`script-${index}`}
								index={index}
								item={item}
								activeEdits={relevantActiveEdits}
								skippedParts={relevantSkippedParts}
								isTimeSelected={isTimeSelected}
								isEditSelected={isEditSelected}
							/>);
						})}
						{/* {domainStore.curIntent.activeEdits.map((edit, index) => {
							const leftScript = filteredScript.find((item) => {
								return item.start <= edit.commonState.offset && item.end >= edit.commonState.offset;
							});
							const rightScript = filteredScript.find((item) => {
								return item.start < edit.commonState.end && item.end >= edit.commonState.end;
							});
							return <ScriptTrimmer 
								key={`trimmer-${index}`}
								edit={edit}
								leftScript={leftScript}
								rightScript={rightScript}
							/>;
						})} */}
					</div>
				)}
				<DragOverlay
                    modifiers={!!activeHandler ? [] : []}
                    dropAnimation={null}
                >
					{!!activeHandler ? (
						<DraggableHandle 
							edit={activeHandler.data.current.edit} 
							isLeftHandler={activeHandler.data.current.isLeftHandler}
							marginLeft={0}
							isOverlay={true}
						/>
					): null}
				</DragOverlay>
			</DndContext>
        </div>
    );
});


export default TextWall;