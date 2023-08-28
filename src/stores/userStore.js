import { action, makeAutoObservable, runInAction, toJS } from "mobx";
import { firestore } from "../services/firebase";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";

class UserStore {
	userId = null;
	userName = null;
	email = null;
	token = null;

	loading = false;

	curSessionIdx = -1;
	curVideoIdx = -1;

	videoLinks = {
		"video-1": "https://youtu.be/ZSt9tm3RoUU",
		"video-2": "https://youtu.be/ZSt9tm3RoUU",
		"video-3": "https://youtu.be/ZSt9tm3RoUU",
		"video-4": "https://youtu.be/ZSt9tm3RoUU",
		"tutorial1": "https://www.youtube.com/live/4LdIvyfzoGY?feature=share",
		"tutorial": "https://www.youtube.com/live/4LdIvyfzoGY?feature=share",
	}

	taskAssignments = {
		"default": [
			{
				videoIds: ["video-1", "video-2"],
				baseline: "video-1",
			},
			{
				videoIds: ["video-3", "video-4"],
				baseline: "video-3",
			},
			{
				videoIds: ["tutorial"],
				baseline: "",
			}
		],
	};

    constructor(rootStore) {
        makeAutoObservable(this);
		this.rootStore = rootStore;
    }

	randomizeTasks() {
		const tutorial = {
			videoIds: ["tutorial"],
			baseline: "",
		};
		const session1 = {
			videoIds: [],
			baseline: "",
		};
		const session2 = {
			videoIds: [],
			baseline: "",
		};
		const videoIds = ["video-1", "video-2", "video-3", "video-4"];
		// should be based on predifined order
		for (let i = 0; i < 2; i++) {
			const idx = Math.floor(Math.random() * videoIds.length);
			session1.videoIds.push(videoIds[idx]);
			videoIds.splice(idx, 1);
		}
		for (let i = 0; i < 2; i++) {
			const idx = Math.floor(Math.random() * videoIds.length);
			session2.videoIds.push(videoIds[idx]);
			videoIds.splice(idx, 1);
		}
		session1.baseline = session1.videoIds[Math.floor(Math.random() * 2)];
		session2.baseline = session2.videoIds[Math.floor(Math.random() * 2)];
		return [
			session1,
			session2,
			tutorial,
		];
	}

	login(userId, userName, email, token) {
		if (userId === this.userId) {
			return;
		}
		if (this.loading === true) return;
		this.loading = true;
		console.log(this.userId, userId);
		this.userId = userId;
		this.userName = userName;
		this.email = email;
		this.token = token;
		this.clearTask();
		this.rootStore.resetAll();
		this.rootStore.fetchFirebase().then(action(() => {
			console.log("fetched last session");
			if (this.taskAssignments[userId] === undefined) {
				this.taskAssignments[userId] = this.randomizeTasks();
			}
			this.loading = false;
		})).catch(action((error) => {
			console.log(error);
			this.taskAssignments[userId] = this.randomizeTasks();
			this.loading = false;
		}));
	}

	logout() {
		this.userId = null;
		this.userName = null;
		this.email = null;
		this.token = null;
		this.clearTask();
		this.rootStore.resetAll();
	}

	clearTask() {
		this.curSessionIdx = -1;
		this.curVideoIdx = -1;	
	}

	async chooseTutorial() {
		if (this.userId === null) {
			return;
		}

		if (this.loading === true) return;
		this.loading = true;
		if (this.taskIdx >= 0) {
			await this.rootStore.saveFirebase().then(action(() => {
				this.rootStore.resetAll();
			})).catch((error) => {
				console.log(error);
			});
		}
		else {
			this.rootStore.resetAll();
		}
		runInAction(async () => {
			this.curSessionIdx = 2;
			this.curVideoIdx = 0;
			try {
				await this.rootStore.fetchTask(this.userId, this.taskIdx);
			} catch (error) {
				runInAction(() => {
					this.rootStore.domainStore.loadVideo(this.videoUrl, this.videoId);
					console.log(error);
				});
			}
			runInAction(async () => {
				this.loading = false;
				await this.saveFirebase();
			});
		});
	}

	async chooseTask(taskIdx) {
		if (this.userId === null) {
			return;
		}
		if (taskIdx < 0 || taskIdx > 3) {
			return;
		}
		if (this.loading === true) return;
		this.loading = true;
		if (this.taskIdx >= 0) {
			await this.rootStore.saveFirebase().then(action(() => {
				this.rootStore.resetAll();
			})).catch((error) => {
				console.log(error);
			});
		}
		else {
			this.rootStore.resetAll();
		}
		runInAction(async () => {
			this.curSessionIdx = Math.floor(taskIdx / 2);
			this.curVideoIdx = taskIdx % 2;
			try {
				await this.rootStore.fetchTask(this.userId, this.taskIdx);
			} catch (error) {
				runInAction(() => {
					this.rootStore.domainStore.loadVideo(this.videoUrl, this.videoId);
					console.log(error);
				});
			}
			runInAction(async () => {
				this.loading = false;
				await this.saveFirebase();
			});
		});
	}

	async taskDone() {
		if (this.userId === null || this.curSessionIdx === -1 || this.curVideoIdx === -1) {
			return;
		}
		if (this.loading === true) return;
		this.loading = true;
		try {
			await this.rootStore.saveFirebase();
			runInAction(action(() => {
				this.clearTask();
				this.rootStore.resetAll();
			}));
		} catch (error) {
			console.log(error);
		}
		runInAction(async () => {
			this.loading = false;
			await this.saveFirebase();
		});
	}

	saveFirebase() {
		if (this.userId === null) {
			return;
		}
		const rootCollection = collection(firestore, this.rootStore.collection);
		const curUserStore = doc(rootCollection, this.userId).withConverter(userStoreConverter);
		return new Promise((resolve, reject) => {
			setDoc(curUserStore, this, {merge: false}).then(() => {
				resolve(this.taskIdx);
			}).catch((error) => {
				reject("user save error: " + error.message);
			});
		});
	}

	fetchFirebase() {
		if (this.userId === null) {
			return;
		}
		const pilots = collection(firestore, this.rootStore.collection);
		const userDoc = doc(pilots, this.userId).withConverter(userStoreConverter);	
		return new Promise((resolve, reject) => {
			getDoc(userDoc).then(action((fetchedUserStore) => {
				const data = fetchedUserStore.exists() ? fetchedUserStore.data() : null;
				if (data.userId === null || data.userId === undefined) {
					this.clearTask();
					if (this.taskAssignments[this.userid] === undefined) {
						this.taskAssignments[this.userId] = this.randomizeTasks();
					}
					resolve(null);
					return;
				}
				else {
					this.userId = data.userId;
					this.userName = data.userName;
					this.email = data.email;
					this.token = data.token;
					this.curSessionIdx = data.curSessionIdx;
					this.curVideoIdx = data.curVideoIdx;
					this.taskAssignments[this.userId] = data.taskAssignment;
					resolve(this.taskIdx);
				}
			})).catch((error) => {
				reject("user fetch error: " + error.message);
			});
		});
	}

	get isLoggedIn() {
		return this.userId !== null;
	}

	get isTaskChosen() {
		return this.curVideoIdx !== -1;
	}

	get isTutorial() {
		return this.curSessionIdx === 2 && this.curVideoIdx === 0;
	}

	get videoId() {
		if (this.userId === null || this.curSessionIdx === -1 || this.curVideoIdx === -1) {
			return null;
		}
		const videoId = this.taskAssignments[this.userId][this.curSessionIdx].videoIds[this.curVideoIdx];
		return videoId;
	}
	
	get videoUrl() {
		if (this.userId === null || this.curSessionIdx === -1 || this.curVideoIdx === -1) {
			return null;
		}
		const videoId = this.taskAssignments[this.userId][this.curSessionIdx].videoIds[this.curVideoIdx];
		return this.videoLinks[videoId];
	}

	get taskIdx() {
		if (this.userId === null || this.curSessionIdx === -1 || this.curVideoIdx === -1) {
			return -1;
		}
		return this.curSessionIdx * 2 + this.curVideoIdx;
	}

	get systemSetting() {
		if (this.userId === null || this.curSessionIdx === -1 || this.curVideoIdx === -1) {
			return false;
		}
		const baselineId = this.taskAssignments[this.userId][this.curSessionIdx].baseline;
		return baselineId !== this.videoId;
	}
}

const userStoreConverter = {
	toFirestore: (userStore) => {
		return {
			userId: userStore.userId,
			userName: userStore.userName,
			email: userStore.email,
			token: userStore.token,
			curSessionIdx: userStore.curSessionIdx,
			curVideoIdx: userStore.curVideoIdx,
			taskAssignment: toJS(userStore.taskAssignments[userStore.userId]),
		};
	},
	fromFirestore: action((snapshot, options) => {
		const data = snapshot.data(options);
		const newData = {
			userId: data.userId,
			userName: data.userName,
			email: data.email,
			token: data.token,
			curSessionIdx: data.curSessionIdx,
			curVideoIdx: data.curVideoIdx,
			taskAssignment: data.taskAssignment,
		};
		return newData;
	})
}

export default UserStore;
