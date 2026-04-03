// File: Client/src/components/LoreIntro.jsx
import { useEffect, useState, useRef } from 'react';
import Button from './Button';
import styles from '../styles/LoreIntro.module.css';

const LoreIntro = ({ onComplete }) => {
	const [isStatic, setIsStatic] = useState(false);
	const [fadePhase, setFadePhase] = useState(0);

	const timerRef = useRef(null);
	const isFinishingRef = useRef(false);

	useEffect(() => {
		if (!isStatic && !isFinishingRef.current) {
			timerRef.current = setTimeout(() => {
				handleFinish();
			}, 92000);
		}

		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [isStatic]);

	const toggleScrollMode = () => {
		setIsStatic(!isStatic);
	};

	const handleFinish = () => {
		if (isFinishingRef.current) return;

		isFinishingRef.current = true;
		setFadePhase(1); // Faza 1: Textul dispare instant, rămâne ecran negru
		if (timerRef.current) clearTimeout(timerRef.current);

		// Faza 2: După 1 secundă, începem să estompăm ecranul negru
		setTimeout(() => {
			setFadePhase(2);
		}, 1000);

		// Faza 3: După 3 secunde (total), se demontează componenta
		setTimeout(() => {
			onComplete();
		}, 3000);
	};

	return (
		<div
			className={styles.loreOverlay}
			style={{
				opacity: fadePhase === 2 ? 0 : 1,
				transition: fadePhase === 2 ? 'opacity 2s ease-in-out' : 'none',
				pointerEvents: fadePhase > 0 ? 'none' : 'auto', // Previne clickurile accidentale in timpul tranzitiei
			}}
		>
			<div
				style={{ opacity: fadePhase > 0 ? 0 : 1, transition: 'opacity 0.5s ease', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
			>
				<div className={isStatic ? styles.scrollContainerStatic : styles.scrollContainer}>
					<div className={isStatic ? styles.staticArea : styles.scrollArea}>
						<h1 className={styles.loreMainTitle}>INKoMOD: The Genesis Chronicle</h1>
						<div className={styles.loreSubtitle}>
							Chronicler: <span className={styles.godSaga}>SAGA</span> (The Eternal Scribe, Goddess of Fate)
							<br />
							Archive: Iron Nature: Knight of Medieval Old Days
						</div>

						<h2 className={styles.chapterTitle}>I. The Era of Singularity and the First Awakening</h2>
						<p className={styles.loreParagraph}>
							Before the first dawn, there was only the void. There was only <span className={styles.godPluto}>Pluto</span>, the{' '}
							<span className={styles.loreTerm}>World Father</span>, seeking order in the endless silence. From the emptiness, he forged two distinct
							planes of existence:
						</p>
						<ol className={styles.loreList}>
							<li className={styles.loreListItem}>
								<span className={styles.highlightTerm}>The High Seat (The Realm of Gods):</span> An elevated, untouchable domain where we, the divine,
								observe and command the tapestry of reality.
							</li>
							<li className={styles.loreListItem}>
								<span className={styles.highlightTerm}>The Mortal Earth:</span> A vast expanse of soil, stone, and untamed nature, waiting for a
								purpose.
							</li>
						</ol>
						<p className={styles.loreParagraph}>
							To govern the laws of this new universe, <span className={styles.godPluto}>Pluto</span> performed his first act of creation. He brought
							forth seven children—the <span className={styles.loreTerm}>New Gods</span>—and bound us to the{' '}
							<span className={styles.loreTerm}>High Seat</span>: <span className={styles.godCronos}>Cronos</span>,{' '}
							<span className={styles.godOdin}>Odin</span>, <span className={styles.godThor}>Thor</span>, <span className={styles.godLoki}>Loki</span>,{' '}
							<span className={styles.godMars}>Mars</span>, <span className={styles.godMidas}>Midas</span>, and myself,{' '}
							<span className={styles.godSaga}>Saga</span>. As the Observer, it is my function to record the absolute truth of our actions, and to watch
							the inevitable path of those who dare to walk the earth below.
						</p>

						<h2 className={styles.chapterTitle}>II. The Forging of the Seven Lands</h2>
						<p className={styles.loreParagraph}>
							With his pantheon established, <span className={styles.godPluto}>Pluto</span> laid the foundations of the physical earth. He sculpted
							exactly seven pristine regions, intending for each to be a flawless, peaceful domain overseen by one of his children.
						</p>
						<p className={styles.loreParagraph}>
							<span className={styles.godCronos}>Cronos</span> set the sun into motion, winding the clock of Time. By{' '}
							<span className={styles.godOdin}>Odin's</span> hand, your ancestors were molded from the clay, populating the seven regions with fragile,
							human life. In this initial age, the earth operated in absolute, conflict-free harmony. It was a perfect, stagnant utopia. And it was
							agonizingly dull. You were safe, but you were nothing.
						</p>

						<h2 className={styles.chapterTitle}>III. The Era of Gifts and Ruin</h2>
						<p className={styles.loreParagraph}>
							To break the stagnation of your existence, we bestowed our divine gifts upon the physical earth. We dropped sparks into the dry tinder of
							mortal minds. We introduced the heavy gleam of gold to awaken your greed, the secrets of forged iron so you could exert dominance, the
							volatility of chance to mock your plans, and the brutal art of war.
						</p>
						<p className={styles.loreParagraph}>
							Empowered by these twisted blessings, mortal kings waged endless campaigns of conquest. Kingdoms rose, bled, and turned to ash in a
							perpetual cycle of slaughter. While the majority of us observed this chaos from the <span className={styles.loreTerm}>High Seat</span> with
							intoxicating amusement, <span className={styles.godPluto}>Pluto</span> viewed the ruin of his creation with cold judgment. And our youngest
							brother, <span className={styles.godMidas}>Midas</span>, grew sick of the greed he had catalyzed.
						</p>

						<h2 className={styles.chapterTitle}>IV. The Descent of the Ageless King</h2>
						<p className={styles.loreParagraph}>
							Rejecting the endless violence orchestrated for our entertainment, <span className={styles.godMidas}>Midas</span> did the unthinkable. He
							abandoned the <span className={styles.loreTerm}>High Seat</span>. He surrendered his divine immortality and descended into the central
							region of <span className={styles.loreTerm}>Domikon</span>, establishing himself as a mortal monarch among men. Under his direct, earthly
							rule, the center achieved absolute peace, forming the foundational core of the <span className={styles.loreTerm}>KOMOD Kingdom</span>.
						</p>
						<p className={styles.loreParagraph}>
							In recognition of this monumental sacrifice, <span className={styles.godPluto}>Pluto</span> granted{' '}
							<span className={styles.godMidas}>Midas</span> a singular defiance against the natural order:{' '}
							<span className={styles.loreTerm}>Agelessness</span>. He became immune to the withering decay of{' '}
							<span className={styles.godCronos}>Cronos</span>, yet remained susceptible to the bleeding steel of{' '}
							<span className={styles.godMars}>Mars</span>. This anomaly birthed the realm's greatest enduring myth:{' '}
							<em>The throne of the world belongs to the mortal who can breach the center and take the God-King's head.</em>
						</p>
						<p className={styles.loreParagraph}>
							Furious at the sudden cessation of our entertainment and <span className={styles.godMidas}>Midas's</span> defiance, the remaining six of us
							escalated our interventions. We united the mortal armies of the six outer provinces, directing a massive, coordinated crusade against{' '}
							<span className={styles.loreTerm}>Domikon</span> to assassinate our fallen brother.
						</p>

						<h2 className={styles.chapterTitle}>V. The Forging of the Iron Nature (I.N.)</h2>
						<p className={styles.loreParagraph}>
							We underestimated our Father. To protect his son and halt our destructive game, <span className={styles.godPluto}>Pluto</span> tore the
							earth asunder. He constructed three absolute, punishing perimeters to crush our armies. This defensive expanse became known as the{' '}
							<span className={styles.loreTerm}>Iron Nature (I.N.)</span>.
						</p>
						<ol className={styles.loreList}>
							<li className={styles.loreListItem}>
								<span className={styles.highlightTerm}>The O.R.B.I.T. Mountains:</span> To shield the center,{' '}
								<span className={styles.godPluto}>Pluto</span> violently thrust the bedrock into the sky, surrounding{' '}
								<span className={styles.loreTerm}>Domikon</span> not once, but five times. These are the{' '}
								<span className={styles.loreTerm}>Five Iron Rings</span>. Between each colossal wall of stone lie vast, treacherous expanses where
								armies were ground into dust attempting to secure the narrow mountain passes. The middle zone between these peaks, known as{' '}
								<em className={styles.loreTerm}>The Bloodline</em>, remains the most vast—a permanent battlefield soaked in the marrow of countless
								failed crusades.
							</li>
							<li className={styles.loreListItem}>
								<span className={styles.highlightTerm}>The W.I.L.D. Forest:</span> When we persisted in our military assaults,{' '}
								<span className={styles.godPluto}>Pluto </span> locked the six outer provinces behind their own impenetrable mountain ranges, leaving
								only a single, suffocating tunnel for each. This geographical bottleneck rendered massive army formations useless. To further terrorize
								the invaders, he drowned these exits in a feral expanse of cursed woods—a purgatory of starvation and predators designed to consume
								those foolish enough to leave the hearth.
							</li>
							<li className={styles.loreListItem}>
								<span className={styles.highlightTerm}>The E.D.G.E. of the World:</span> And for those who try to flee the realm entirely? In a final
								act of containment, <span className={styles.godPluto}>Pluto</span> carved an inescapable abyss at the absolute perimeter of existence.
								There, he locked away the <span className={styles.loreTerm}>Nephilims</span> and ancient terrors, sealing the borders of the world for
								eternity.
							</li>
						</ol>

						<h2 className={styles.chapterTitle}>VI. The INKoMOD Realm</h2>
						<p className={styles.loreParagraph}>
							The world no longer exists as a utopia; it is an iron-forged quarantine. The civilized heart of the{' '}
							<span className={styles.loreTerm}>KOMOD Kingdom</span> is forever choked by the untamed wrath of the{' '}
							<span className={styles.loreTerm}>Iron Nature</span>. Together, this fusion of order and chaos forms the final realm: The{' '}
							<span className={styles.loreTerm}>INKoMOD Realm</span>.
						</p>
						<p className={styles.loreParagraph}>
							The colossal stone rings and feral choke points of the wilderness have broken the age of massive armies. We can no longer march thousands
							to war. Instead, we play a more intimate game. We elevate individual mortal champions, the <span className={styles.loreTerm}>Knights</span>
							, to carry our will through the meat grinder of the mountain passes.
						</p>
						<p className={styles.loreParagraph}>
							These knights are driven by two divergent destinies. They must either battle through the rings of stone to strike down the God-King and
							usurp his eternal throne, or secure his favor by paying the ultimate tithe in gold, buying the right to end their days in peace as living{' '}
							<span className={styles.loreTerm}>Legends</span>.
						</p>
						<p className={styles.loreParagraph}>You must carve one of these paths through the blood and the dirt, or perish forgotten in the wilds.</p>

						<div className={styles.dramaticEnd}>
							<p>So, mortal... what will you do?</p>
							<p style={{ marginTop: '20px', fontSize: '1.2rem', color: '#888' }}>
								I am kidding, of course. I am <span className={styles.godSaga}>Saga</span>.<br />I already know how your story ends.
							</p>
						</div>
					</div>
				</div>

				<div className={styles.bottomControls}>
					<div className={styles.buttonGroup}>
						<Button
							onClick={toggleScrollMode}
							variant='secondary'
							disabled={fadePhase > 0}
						>
							{isStatic ? 'Auto Scroll' : 'Read Manually'}
						</Button>
						<Button
							onClick={handleFinish}
							variant='primary'
							disabled={fadePhase > 0}
						>
							Skip Intro
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoreIntro;
