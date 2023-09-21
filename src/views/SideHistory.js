import React, { useEffect, useState } from "react";

import { observer } from "mobx-react-lite";
import { action, observe, reaction } from "mobx";

import useRootContext from "../hooks/useRootContext";
import NewIntent from "../components/general/NewIntent";
import TrashcanIcon from "../icons/TrashcanIcon";
import CopyIcon from "../icons/CopyIcon";
import { AiOutlineHistory } from "react-icons/ai";

const SuggHistoryItem = observer(function SuggHistoryItem(
	{ idx, historyIdx, collapsed }
) {
	const { domainStore } = useRootContext();
	const curIntent = domainStore.intents[domainStore.curIntentPos];
	const intent = domainStore.intents[idx];
	const entry = intent.history[historyIdx];
	const historyPos = intent.historyPos;
	const onDeleteClick = action((event) => {
		event.preventDefault();
		event.stopPropagation();
		if (domainStore.processingIntent) {
			alert("Cannot delete history point while processing.");
			return;
		}
		if (window.confirm("Delete this history point? You cannot restore this history point.")) {
			intent.deleteHistory(historyIdx);
		}
	});

	const onEntryClick = action((event) => {
		event.preventDefault();
		event.stopPropagation();
		if (intent.idx !== curIntent.idx) {
			domainStore.setCurIntent(idx);
		}
		if (historyPos !== historyIdx) {
			intent.restoreHistory(historyIdx);
		}
	});

	const isSelected = historyPos === historyIdx && intent.idx === curIntent.idx;

	const title = isSelected ? intent.summary : entry.summary;

	const bgColor = "bg-yellow-100";
	const hoverColor = "bg-yellow-200";
	const selectColor = "bg-yellow-500";
	const className = ("px-1 py-1 flex justify-between gap-2 ml-5 italic"
		+ (isSelected ? ` ${selectColor} hover:${hoverColor}` : ` ${bgColor} hover:${hoverColor}`)
	);

	console.log("rerender", historyPos)

	return (<div className={className}
		onClick={onEntryClick}
	>
		<button
			className={"text-left text-black text-sm py-2 px-2 rounded flex flex-row gap-1 items-center"
				+ (collapsed ? " truncate" : "")
			}
			disabled={isSelected}
		>
			{
				historyIdx === curIntent.history.length - 1 ? (
					<span> <AiOutlineHistory /> </span>
				) : (
					<span> <AiOutlineHistory /> </span>
				)
			}
			{title === "" ? `Description ${historyIdx + 1}` : title}
		
		</button>
		{
			collapsed ? null : (
			<div className="w-fit flex gap-2 justify-center">
				<button 
					className="w-fit bg-red-500 hover:bg-red-700 text-white text-xs font-bold py-2 px-2 rounded disabled:opacity-50 disabled:hover:bg-red-500"
					onClick={onDeleteClick}
					disabled={intent.history.length === 1}
				> 	
					<TrashcanIcon />
				</button>
			</div>)
		}
	</div>);
});

const HistoryItem = observer(function HistoryItem({ idx, collapsed }) {
	const { domainStore } = useRootContext();
	const curIntent = domainStore.intents[domainStore.curIntentPos];
	const intent = domainStore.intents[idx];

	const onDeleteClick = action((event, intentPos) => {
		event.preventDefault();
		event.stopPropagation();
		if (domainStore.processingIntent) {
			alert("Cannot delete edit while processing.");
			return;
		}
		if (window.confirm("Delete this edit? You cannot restore this edit.")) {
			domainStore.deleteIntent(intentPos);
		}
	});

	const onCopyClick = action((event, intentPos) => {
		event.preventDefault();
		event.stopPropagation();
		if (window.confirm("Duplicate this edit to current? Your current edit will be overwritten.")) {
			domainStore.copyIntentToCurrent(intentPos);
		}
	});

	const onIntentClick = action((event, intentPos) => {
		event.preventDefault();
		event.stopPropagation();
		domainStore.setCurIntent(intentPos);
	});

	const titleIdx = intent.idx;
	const isSelected = curIntent.idx === titleIdx;

	const editOperationTitle = intent.editOperation === null ? "None" : intent.editOperation.title;

	// TODO: summarize all descriptions in the history
	const title = intent.history.length === 0 ? ("") : (
		isSelected ? intent.summary : intent.history[intent.history.length - 1].summary
	);
	// if (isSelected)
	// 	console.log("History: ", intent.summary, intent.history.map((entry) => entry.summary));

	const bgColor = "bg-gray-100";
	const hoverColor = "bg-gray-400";
	const className = ("px-1 py-1 flex justify-between gap-2"
		+ (isSelected ? ` ${hoverColor}` : ` ${bgColor} hover:${hoverColor}`)
	);

	return (<div className={className}
		onClick={(event) => onIntentClick(event, idx)}
	>
		<button
			className={"text-left truncate text-black font-bold py-2 px-2 rounded"
			}
			disabled={isSelected}
		>
			{/* {titleIdx} - {`[${title}]`}: {intent.summary} */}
			{titleIdx}: {title === "" ? editOperationTitle : title}
		
		</button>
		{
			collapsed ? null : (
			<div className="w-fit flex gap-2 justify-center">
				{curIntent.idx === titleIdx ? null
				: (<button
					className="w-fit text-left bg-indigo-300 hover:bg-indigo-400 text-white py-2 px-2 rounded"
					onClick={(event) => onCopyClick(event, idx)}
				> 
					<CopyIcon />
				</button>)}
				<button 
					className="w-fit bg-red-500 hover:bg-red-700 text-white text-xs font-bold py-2 px-2 rounded"
					onClick={(event) => onDeleteClick(event, idx)}
					//disabled={curIntent.activeEdits.length === 0}
				> 	
					<TrashcanIcon />
				</button>
			</div>)
		}
	</div>);
});

const SideHistory = observer(function SideHistory() {
	const { uiStore, domainStore } = useRootContext();
	const curIntent = domainStore.intents[domainStore.curIntentPos];
	const reversedIntents = Array.from(domainStore.intents).reverse();

	const [collapsed, setCollapsed] = useState(true);

	return (<div 
		className={"absolute overflow-y-scroll bg-gray-100 divide-y divide-gray-400 h-full z-30"
			+ (collapsed ? " w-full" : " w-64")
		}
		onMouseEnter={() => setCollapsed(false)}
		onMouseLeave={() => setCollapsed(true)}
	>
		<div className="p-1">
			Edit List
		</div>
		<div className="p-1">
			<NewIntent collapsed={collapsed} />
		</div>
		{reversedIntents.length === 0 ? (
			<div> No edits </div>
			) : (
			reversedIntents.map((_, revIdx) => {
				const idx = reversedIntents.length - revIdx - 1;
				const intent = domainStore.intents[idx];
				const reversedHistory = Array.from(intent.history).reverse();
				return (<div key={`history-item-${idx}`}>
					<HistoryItem 
						idx={idx}
						collapsed={collapsed}
					/>
					{/* { reversedHistory.map((entry, revHistoryIdx) => {
						const historyIdx = reversedHistory.length - revHistoryIdx - 1;
						return (<SuggHistoryItem
							key={`history-item-${idx}-${historyIdx}`}
							entry={entry}
							idx={idx}
							historyIdx={historyIdx}
							intent={intent}
							collapsed={collapsed}
						/>);
					})} */}
					{curIntent.idx === intent.idx ? (reversedHistory.map((_, revHistoryIdx) => {
						const historyIdx = reversedHistory.length - revHistoryIdx - 1;
						return (<SuggHistoryItem
							key={`history-item-${idx}-${historyIdx}`}
							idx={idx}
							historyIdx={historyIdx}
							collapsed={collapsed}
						/>);
					})) : null}
				</div>);
			}))
		}
	</div>);
});

export default SideHistory;