import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers'
import {
    useQuery,
    gql
} from "@apollo/client";
const { buildEddsa } = require("circomlibjs");

import styles from './bets.module.css'
import { Brazilian, Bets } from '../../contracts'
import { Button, Input } from '../../components';
import { Card, CardContent } from '@mui/material';
import { genEcdhSharedKey, } from '../../utils/encryption'

const myBetsQuery = gql`
  query GetBets($better: String) {
    getBets(input: { better: $better }) {
      id
      champId
      matchId
      betType
    }
  }
`;

const MyBets: React.FC<{ logout: Function }> = ({ logout }) => {
    const { data } = useQuery(myBetsQuery, {
        variables: { better: localStorage.getItem('identityCommitment') },
    });
    const [winnerBets, setWinnerBets] = useState<any[]>([])
    const [scoreBets, setScoreBets] = useState<any[]>([])
    const [goalsBets, setGoalsBets] = useState<any[]>([])

    useEffect(() => {
        if (data) {
            const getBetData = async () => {
                const storedIdentityCommitment = localStorage.getItem('identityCommitment');
                const storedIdentity = localStorage.getItem('identity');

                if (!storedIdentity || !storedIdentityCommitment) {
                    logout()
                    return
                }

                const pubKey = await Brazilian.getCoordinatorPubKey()

                const eddsa = await buildEddsa()
                const sharedSecret = await genEcdhSharedKey({
                    eddsa,
                    privKey: BigInt(storedIdentity),
                    pubKey
                })

                await Promise.all(data.getBets.map(async (i: any) => {
                    if (i.betType === 'goals') {
                        const b = await Bets.getGoalsBet(sharedSecret, i.champId, i.matchId, i.id)
                        setGoalsBets([...goalsBets, b])
                    } else if (i.betType === 'score') {
                        const b = await Bets.getScoreBet(sharedSecret, i.champId, i.matchId, i.id)
                        setScoreBets([...scoreBets, b])
                    } else {
                        const b = await Bets.getWinnerBet(sharedSecret, i.champId, i.matchId, i.id)
                        setWinnerBets([...winnerBets, b])
                    }
                }))
            }
            getBetData()
        }
    }, [data])

    return (
        <div className={styles.viewScroll}>
            <div className={styles.content}>
                {winnerBets.map((b, i) => {
                    return (
                        <Card key={i} className={styles.match}>
                            <CardContent>
                                <div className={styles.teams}>
                                    <p>house wins? {b.house}</p>
                                    <p>value {b.value.toString()}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
                {scoreBets.map((b, i) => {
                    return (
                        <Card key={i + 5} className={styles.match}>
                            <CardContent>
                                <div className={styles.teams}>
                                    <p>house goals {b.house}</p>
                                    <p>visitor goals {b.visitor}</p>
                                    <p>value {b.value.toString()}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
                {goalsBets.map((b, i) => {
                    return (
                        <Card key={i + 675} className={styles.match}>
                            <CardContent>
                                <div className={styles.teams}>
                                    <p>house? {b.house}</p>
                                    <p>goals {b.goals}</p>
                                    <p>value {b.value.toString()}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    );
}

export default MyBets
