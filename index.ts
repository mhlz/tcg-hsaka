import { chain, error } from "@opencreek/ext"

const STARTING_DECK = [1, 2, 3, 4, 5]

const NUMBER_OF_PLAYERS = 50

const NUMBER_OF_DAYS = 10
const NUMBER_OF_BATTLES_PER_DAY = 40

const CARDS_TO_UPGRADE = 2

const PIECES_TO_WIN = ["joker-1", "joker-2", "joker-3", "joker-4"] as const

const PLAYERS = Array.from({ length: NUMBER_OF_PLAYERS }, (_, i) => ({
	id: i + 1,
	deck: STARTING_DECK.slice(0) as Deck,
}))

type Players = typeof PLAYERS
type Player = Players[number]
type Joker = (typeof PIECES_TO_WIN)[number]
type Card = number | Joker
type Deck = Card[]

distributePiecesToWin(PLAYERS, PIECES_TO_WIN)

for (let day = 0; day < NUMBER_OF_DAYS; day++) {
	for (let i = 0; i < NUMBER_OF_BATTLES_PER_DAY; i++) {
		const player1 = PLAYERS[Math.floor(Math.random() * PLAYERS.length)]
		const player2 = PLAYERS[Math.floor(Math.random() * PLAYERS.length)]
		battle(player1, player2)

		if (player1.deck.length === 0) {
			PLAYERS.splice(PLAYERS.indexOf(player1), 1)
		}
		if (player2.deck.length === 0) {
			PLAYERS.splice(PLAYERS.indexOf(player2), 1)
		}
	}

	for (const player of PLAYERS) {
		const grouped = chain(player.deck).groupBy((card) =>
			typeof card === "number" ? card : "joker",
		)

		const upgradeables = grouped
			.filterValues((cards) => cards.length >= CARDS_TO_UPGRADE)
			.values()
		for (const upgradeable of upgradeables) {
			const card = upgradeable[0] as Card
			if (typeof card === "string") {
				if (upgradeable.length >= 4) {
					console.dir({ player }, { depth: null })
					error("player has 4 jokers")
				}
				continue
			}
			const numOfUpgrades = Math.floor(upgradeable.length / CARDS_TO_UPGRADE)
			player.deck = player.deck.filter((c) => c !== card)
			for (let i = 0; i < numOfUpgrades; i++) {
				player.deck.push(card + 1)
			}
			shuffle(player.deck)
		}
	}
}

console.dir({ PLAYERS, l: PLAYERS.length }, { depth: null })

function battle(player1: Player, player2: Player, tries = 0) {
	if (tries > 10) {
		return
	}
	const hand1 = shuffle(player1.deck).slice(0, 3)
	const hand2 = shuffle(player2.deck).slice(0, 3)

	const player1Score = chain(hand1).maxBy((card) =>
		typeof card === "number" ? card : 0,
	)
	const player2Score = chain(hand2).maxBy((card) =>
		typeof card === "number" ? card : 0,
	)

	if (player1Score == player2Score) {
		battle(player1, player2, tries + 1)
		return
	}

	const winner = player1Score! > player2Score! ? player1 : player2
	const loser = player1Score! > player2Score! ? player2 : player1

	const prizeCard = loser.deck.pop()!
	if (prizeCard === undefined) {
		error("prizeCard is undefined")
	}
	winner.deck.unshift(prizeCard)
	shuffle(winner.deck)
}

function distributePiecesToWin(
	players: Players,
	piecesToWin: readonly Joker[],
) {
	const shuffledPlayers = shuffle(players)
	for (let i = 0; i < piecesToWin.length; i++) {
		const player = shuffledPlayers[i]
		player.deck.push(piecesToWin[i])
	}
}

function shuffle<T>(array: Array<T>): Array<T> {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[array[i], array[j]] = [array[j], array[i]]
	}
	return array
}
