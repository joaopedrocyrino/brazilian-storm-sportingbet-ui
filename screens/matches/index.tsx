import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers'
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import moment from 'moment';
const { buildEddsa } = require("circomlibjs");

import styles from './matches.module.css'
import { Matches } from '../../contracts'
import { Button, Input } from '../../components';
import { useAlertContext } from '../../providers'
import { Bets, Brazilian } from '../../contracts'
import { genEcdhSharedKey } from '../../utils/encryption'

const MatchesDisplay: React.FC<{ logout: Function }> = ({ logout }) => {
    const [matches, setmatches] = useState<any[]>([]);
    const [bet, setBet] = useState<boolean>(false);
    const [betWinner, setBetWinner] = useState<boolean>(false);
    const [betScore, setBetScore] = useState<boolean>(false);
    const [betGoals, setBetGoals] = useState<boolean>(false);
    const [match, setMatch] = useState<any>({});
    const [amount, setAmount] = useState<number>(0);
    const [house, setHouse] = useState<number>(0);
    const [visitor, setVisitor] = useState<number>(0);
    const { notify } = useAlertContext()

    const winnerBet = async (h: boolean) => {
        try {
            const storedIdentityCommitment = localStorage.getItem('identityCommitment');
            const storedIdentity = localStorage.getItem('identity');

            if (!storedIdentity || !storedIdentityCommitment) {
                logout()
                return
            }

            const balance = await Brazilian.getBalance(BigInt(storedIdentityCommitment), BigInt(storedIdentity))
            const pubKey = await Brazilian.getCoordinatorPubKey()

            const eddsa = await buildEddsa()
            const sharedSecret = await genEcdhSharedKey({
                eddsa,
                privKey: BigInt(storedIdentity),
                pubKey
            })

            await Bets.betWinner(
                BigInt(storedIdentity),
                balance,
                ethers.utils.parseEther(amount.toString()).toBigInt(),
                sharedSecret,
                match.champId,
                match.matchId,
                h
            )

            cancel()
        } catch (e) {
            console.log(e)
            notify('error while betting try again', 'error')
        }
    }

    const scoreBet = async () => {
        try {
            const storedIdentityCommitment = localStorage.getItem('identityCommitment');
            const storedIdentity = localStorage.getItem('identity');

            if (!storedIdentity || !storedIdentityCommitment) {
                logout()
                return
            }

            const balance = await Brazilian.getBalance(BigInt(storedIdentityCommitment), BigInt(storedIdentity))
            const pubKey = await Brazilian.getCoordinatorPubKey()

            const eddsa = await buildEddsa()
            const sharedSecret = await genEcdhSharedKey({
                eddsa,
                privKey: BigInt(storedIdentity),
                pubKey
            })

            await Bets.betScore(
                BigInt(storedIdentity),
                balance,
                ethers.utils.parseEther(amount.toString()).toBigInt(),
                sharedSecret,
                match.champId,
                match.matchId,
                house,
                visitor
            )

            cancel()
        } catch (e) {
            console.log(e)
            notify('error while betting try again', 'error')
        }
    }

    const goalBet = async (h: boolean) => {
        try {
            const storedIdentityCommitment = localStorage.getItem('identityCommitment');
            const storedIdentity = localStorage.getItem('identity');

            if (!storedIdentity || !storedIdentityCommitment) {
                logout()
                return
            }

            const balance = await Brazilian.getBalance(BigInt(storedIdentityCommitment), BigInt(storedIdentity))
            const pubKey = await Brazilian.getCoordinatorPubKey()

            const eddsa = await buildEddsa()
            const sharedSecret = await genEcdhSharedKey({
                eddsa,
                privKey: BigInt(storedIdentity),
                pubKey
            })

            await Bets.betGoals(
                BigInt(storedIdentity),
                balance,
                ethers.utils.parseEther(amount.toString()).toBigInt(),
                sharedSecret,
                match.champId,
                match.matchId,
                h,
                house
            )

            cancel()
        } catch (e) {
            console.log(e)
            notify('error while betting try again', 'error')
        }
    }

    const cancel = () => {
        setBet(false)
        setMatch({})
        setBetWinner(false)
        setBetGoals(false)
        setBetScore(false)
        setAmount(0)
        setHouse(0)
        setVisitor(0)
    }

    useEffect(() => {
        const init = async () => {
            try {
                const championships = await Matches.getChampionships()

                const m: any[] = [];

                await Promise.all(championships.map(async (c) => {
                    if (!c.closed) {
                        const champMatches = await Matches.getMatches(c.id)
                        champMatches.forEach(cm => {
                            if (!cm.closed && !cm.resultsFullfilled) {
                                m.push({
                                    championship: c.name,
                                    champId: c.id,
                                    matchId: cm.id,
                                    house: cm.house,
                                    visitor: cm.visitor,
                                    start: cm.start,
                                    season: c.season
                                })
                            }
                        })
                    }
                }))

                setmatches(m)
            } catch (e) {
                console.log(e)
            }
        }

        init()
    }, [])

    if (betWinner) {
        return (
            <div className={styles.betContainer}>
                <div className={styles.row}>
                    <p>{match.house}</p>
                    vs
                    <p>{match.visitor}</p>
                </div>
                <p>Who wins?</p>
                <div className={styles.inputWrapper}>
                    <Input
                        type='number'
                        value={amount}
                        setValue={setAmount}
                        placeholder='Amount'
                    />
                </div>
                <Button
                    label={match.house}
                    onClick={() => { winnerBet(true) }}
                    variant='contained'
                    width={200}
                    height={35}
                />
                <Button
                    variant='contained'
                    label={match.visitor}
                    onClick={() => { winnerBet(false) }}
                    width={200}
                    height={35}
                />
                <Button
                    label='CANCEL'
                    onClick={cancel}
                    variant='outlined'
                    width={200}
                    height={35}
                />
            </div >
        )
    }

    if (betScore) {
        return (
            <div className={styles.betContainer}>
                <div className={styles.row}>
                    <p>{match.house}</p>
                    vs
                    <p>{match.visitor}</p>
                </div>
                <p>What the score?</p>
                <div className={styles.inputWrapper}>
                    <Input
                        type='number'
                        value={house}
                        setValue={setHouse}
                        placeholder={`${match.house} will score how many goals?`}
                    />
                </div>
                <div className={styles.inputWrapper}>
                    <Input
                        type='number'
                        value={visitor}
                        setValue={setVisitor}
                        placeholder={`${match.visitor} will score how many goals?`}
                    />
                </div>
                <div className={styles.inputWrapper}>
                    <Input
                        type='number'
                        value={amount}
                        setValue={setAmount}
                        placeholder='Amount'
                    />
                </div>
                <Button
                    label="BET"
                    onClick={() => { scoreBet() }}
                    variant='contained'
                    width={200}
                    height={35}
                />
                <Button
                    label='CANCEL'
                    onClick={cancel}
                    variant='outlined'
                    width={200}
                    height={35}
                />
            </div >
        )
    }

    if (betGoals) {
        return (
            <div className={styles.betContainer}>
                <div className={styles.row}>
                    <p>{match.house}</p>
                    vs
                    <p>{match.visitor}</p>
                </div>
                <p>How many goals one of them will score?</p>
                <div className={styles.inputWrapper}>
                    <Input
                        type='number'
                        value={house}
                        setValue={setHouse}
                        placeholder="how many goals?"
                    />
                </div>

                <div className={styles.inputWrapper}>
                    <Input
                        type='number'
                        value={amount}
                        setValue={setAmount}
                        placeholder='Amount'
                    />
                </div>
                <Button
                    label={`${match.house} scores`}
                    onClick={() => { goalBet(true) }}
                    variant='contained'
                    width={200}
                    height={35}
                />
                <Button
                    label={`${match.visitor} scores`}
                    onClick={() => { goalBet(false) }}
                    variant='contained'
                    width={200}
                    height={35}
                />
                <Button
                    label='CANCEL'
                    onClick={cancel}
                    variant='outlined'
                    width={200}
                    height={35}
                />
            </div >
        )
    }

    if (bet) {
        return (
            <div className={styles.betContainer}>
                <div className={styles.row}>
                    <p>{match.house}</p>
                    vs
                    <p>{match.visitor}</p>
                </div>
                <Button label='BET WINNER'
                    onClick={() => { setBetWinner(true) }}
                    variant='contained'
                    width={200}
                    height={35}
                />
                <Button
                    variant='contained'
                    label='BET SCORE'
                    onClick={() => { setBetScore(true) }}
                    width={200}
                    height={35}
                />
                <Button
                    label='BET GOALS'
                    onClick={() => { setBetGoals(true) }}
                    variant='contained'
                    width={200}
                    height={35}
                />
                <Button
                    label='CANCEL'
                    onClick={cancel}
                    variant='outlined'
                    width={200}
                    height={35}
                />
            </div>
        )
    }

    return (
        <div className={styles.viewScroll}>
            <div className={styles.content}>
                {matches.map((match, i) => {
                    return (
                        <Card key={i} className={styles.match}>
                            <CardContent>
                                <div className={styles.teams}>
                                    <p>{match.house}</p>
                                    vs
                                    <p>{match.visitor}</p>
                                </div>
                                <p className={styles.date}>{`${moment.unix(match.start).format("dddd, MMMM Do YYYY, h:mm a")}`}</p>
                            </CardContent>
                            <CardActions>
                                <Button label='BET' onClick={() => {
                                    setBet(true)
                                    setMatch(match)
                                }} />
                            </CardActions>
                        </Card>
                    )
                })}
            </div>
        </div>
    );
}

export default MatchesDisplay
