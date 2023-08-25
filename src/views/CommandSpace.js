import React, { useState } from "react";

import { observer } from "mobx-react-lite";
import { action } from "mobx";

import useRootContext from "../hooks/useRootContext";
import SketchCanvas from "../components/command-space/SketchCanvas";



const CommandSpace = observer(function CommandSpace() {
	const { uiStore, domainStore } = useRootContext();
	const curIntent = domainStore.intents[domainStore.curIntentPos];
	const reversedIntents = [...domainStore.intents].reverse();

	const onChangeTextCommand = (event) => {
		curIntent.setTextCommand(event.target.value);
	}

	const onAddClick = action(() => {
		domainStore.addIntent();
	});

	const onDeleteClick = action((intentPos) => {
		domainStore.deleteIntent(intentPos);
	});

	const onCopyClick = action((intentPos) => {
		domainStore.copyIntentToCurrent(intentPos);
	});

	const onIntentClick = action((intentPos) => {
		domainStore.setCurIntent(intentPos);
	});

	const onProcessClick = action(() => {
		console.log(JSON.stringify(domainStore.processIntent()));
	});

	return (<div className="flex justify-between my-5">
		<div className="w-2/3 flex flex-col items-center mx-2">
			<h2> Edit #{curIntent.idx} </h2>
			<input 
				id="textCommand" 
				type="text"
				placeholder="description"
				value={curIntent.textCommand}
				className="w-full border p-2"
				onChange={onChangeTextCommand} 
			/>
			<div className="w-full flex flex-row gap-2 justify-between my-2 p-2 border">
				<SketchCanvas />
				<button 
					className="w-fit h-fit bg-indigo-300 hover:bg-indigo-400 text-black font-bold py-2 px-4 rounded"
					onClick={() => onProcessClick()}
					//disabled={curIntent.textCommand === "" && curIntent.sketchCommand.length === 0}
				>
					Process
				</button>
			</div>
		</div>
		<div className="w-1/3">
			<h2> Edits: </h2>
			<div className="border p-2">
				<button 
					className="w-fit bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
					onClick={() => onAddClick()} 
					// disabled={curIntent.activeEdits.length === 0}
				>
					+ 
				</button> 
				{reversedIntents.length === 0 ? (
					<div> No edits </div>
					) : (
					reversedIntents.map((intent, revIdx) => {
						const idx = reversedIntents.length - revIdx - 1;
						const titleIdx = intent.idx;
						const title = intent.editOperation === null ? "None" : intent.editOperation.title;
						return <div  key={"intent" + idx} className="my-2 flex justify-between gap-2">
							<button
								className={(curIntent.idx === titleIdx ? "bg-indigo-500 " : "bg-indigo-300  hover:bg-indigo-400 ")
									+ "text-left text-black font-bold py-2 px-4 rounded"
								}
								disabled={curIntent.idx === titleIdx}
								onClick={() => onIntentClick(idx)}
							>
								{titleIdx} - {`[${title}]`}: "{intent.textCommand}"
							</button>
							<div className="w-fit flex gap-2 justify-center p-2">
								{curIntent.idx === titleIdx ? null
								: (<button
									className="w-fit text-left bg-indigo-300 hover:bg-indigo-400 text-black py-2 px-4 rounded"
									onClick={() => onCopyClick(idx)}
									// copy confirm
								> Copy </button>)}
								<button 
									className="w-fit bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
									onClick={() => onDeleteClick(idx)}
									// disabled={curIntent.activeEdits.length === 0}
									// confirm delete
								> Delete </button>
							</div>
						</div>
					}))
				}
			</div>
		</div>
	</div>);
});

export default CommandSpace;