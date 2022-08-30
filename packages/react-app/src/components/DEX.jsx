import { Card, Col, Divider, Input, Row, Menu, Dropdown } from "antd";

import { DownOutlined } from "@ant-design/icons";
import { useBalance, useContractReader, useBlockNumber, readContract } from "eth-hooks";
// import { useEventListener } from "eth-hooks/events/useEventListener";
import { useTokenBalance } from "eth-hooks/erc/erc-20/useTokenBalance";
import { ethers } from "ethers";
import React, { useState, useEffect } from "react";
import Address from "./Address";
import Contract from "./Contract";
import Curve from "./Curve";
import TokenBalance from "./TokenBalance";
// import Blockies from "react-blockies";

const contractName = "DEX";

export default function Dex(props) {
  let display = [];

  const tokenName = props.tokenName;
  const [form, setForm] = useState({});
  const [values, setValues] = useState({});
  const tx = props.tx;

  const menu = (
    <Menu>
      <Menu.Item onClick={props.method} key="Balloons">
        🎈 Balloon
      </Menu.Item>
      <Menu.Item onClick={props.method} key="Monkey">
        🐵 APE
      </Menu.Item>
      <Menu.Item onClick={props.method} key="Frogger">
        🐸 FROG
      </Menu.Item>
    </Menu>
  );

  const writeContracts = props.writeContracts;
  const balInEth = ethers.utils.formatEther(props.yourLocalBalance);

  const contractAddress = props.readContracts[contractName].address;
  const tokenAddress = props.readContracts[tokenName].address;
  // const contractBalance = useBalance(props.localProvider, contractAddress);

  const balloonsTokenBalance = useTokenBalance(props.readContracts.Balloons, contractAddress, props.localProvider);
  const monkeyTokenBalance = useTokenBalance(props.readContracts.Monkey, contractAddress, props.localProvider);
  const froggerTokenBalance = useTokenBalance(props.readContracts.Frogger, contractAddress, props.localProvider);
  const [tokenBalanceFloat, setTokenBalanceFloat] = useState();

  // const ethBalanceFloat = parseFloat(ethers.utils.formatEther(contractBalance));

  const [contractBalanceByToken, setContractBalanceByToken] = useState();

  const balloonsEthBal = useContractReader(
    props.readContracts,
    contractName,
    "getBalancesPerTok",
    [props.readContracts.Balloons.address],
    1337,
  );
  const monkeyEthBal = useContractReader(
    props.readContracts,
    contractName,
    "getBalancesPerTok",
    [props.readContracts.Monkey.address],
    1337,
  );
  const froggerEthBal = useContractReader(
    props.readContracts,
    contractName,
    "getBalancesPerTok",
    [props.readContracts.Frogger.address],
    1337,
  );

  const [liquidityPerToken, setLiquidityPerToken] = useState();
  console.log("==========", contractBalanceByToken, "==========");
  const liquidityForBalloons = useContractReader(
    props.readContracts,
    contractName,
    "getTotalLiquidityPerTok",
    [props.readContracts.Balloons.address],
    1337,
  );
  const liquidityForMonkey = useContractReader(
    props.readContracts,
    contractName,
    "getTotalLiquidityPerTok",
    [props.readContracts.Monkey.address],
    1337,
  );
  const liquidityForFrogger = useContractReader(
    props.readContracts,
    contractName,
    "getTotalLiquidityPerTok",
    [props.readContracts.Frogger.address],
    1337,
  );
  const userLiquidityBalloons = useContractReader(props.readContracts, "DEX", "getUserLiquidityTok", [
    props.address,
    props.readContracts.Balloons.address,
  ]);
  const userLiquidityMonkey = useContractReader(props.readContracts, "DEX", "getUserLiquidityTok", [
    props.address,
    props.readContracts.Monkey.address,
  ]);
  const userLiquidityFrogger = useContractReader(props.readContracts, "DEX", "getUserLiquidityTok", [
    props.address,
    props.readContracts.Frogger.address,
  ]);
  const [userLiquidity, setUserLiquidity] = useState();
  const setUserStates = () => {
    let userLiquid;
    let ethBal;
    let totalLiquid;
    let tokenBalance;
    if (tokenName === "Balloons") {
      userLiquid = userLiquidityBalloons;
      ethBal = balloonsEthBal;
      totalLiquid = liquidityForBalloons;
      tokenBalance = balloonsTokenBalance;
    } else if (tokenName === "Monkey") {
      userLiquid = userLiquidityMonkey;
      ethBal = monkeyEthBal;
      totalLiquid = liquidityForMonkey;
      tokenBalance = monkeyTokenBalance;
    } else if (tokenName === "Frogger") {
      userLiquid = userLiquidityFrogger;
      ethBal = froggerEthBal;
      totalLiquid = liquidityForFrogger;
      tokenBalance = froggerTokenBalance;
    } else {
      userLiquid = 0;
      ethBal = 0;
      totalLiquid = 0;
      tokenBalance = 0;
    }
    setUserLiquidity(userLiquid);
    setContractBalanceByToken(ethBal);
    setLiquidityPerToken(totalLiquid);
    let x = parseFloat(ethers.utils.formatEther(tokenBalance));
    setTokenBalanceFloat(x);
    console.log("=========token bal: ", x, "===========");
  };

  // const balloonApproval = useEventListener()
  useEffect(() => {
    setUserStates();
  }, [tokenName, tx]);

  const rowForm = (title, icon, onClick) => {
    return (
      <Row>
        <Col span={8} style={{ textAlign: "right", opacity: 0.333, paddingRight: 6, fontSize: 24 }}>
          {title}
        </Col>
        <Col span={16}>
          <div style={{ cursor: "pointer", margin: 2 }}>
            <Input
              onChange={e => {
                let newValues = { ...values };
                newValues[title] = e.target.value;
                setValues(newValues);
              }}
              value={values[title]}
              addonAfter={
                <div
                  type="default"
                  onClick={() => {
                    onClick(values[title]);
                    let newValues = { ...values };
                    newValues[title] = "";
                    setValues(newValues);
                  }}
                >
                  {icon}
                </div>
              }
            />
          </div>
        </Col>
      </Row>
    );
  };

  if (props.readContracts && props.readContracts[contractName]) {
    display.push(
      <div>
        {balInEth}
        {rowForm("ethToToken", "💸", async value => {
          let valueInEther = ethers.utils.parseEther("" + value);
          let valuePlusExtra = ethers.utils.parseEther("" + value * 1.03);
          console.log("valuePlusExtra", valuePlusExtra);
          let swapEthToTokenResult = await tx(
            writeContracts[contractName]["ethToToken"](tokenAddress, { value: valuePlusExtra }),
          );
          console.log("swapEthToTokenResult:", swapEthToTokenResult);
        })}

        {rowForm("tokenToEth", "🔏", async value => {
          let valueInEther = ethers.utils.parseEther("" + value);
          console.log("valueInEther", valueInEther);
          let valuePlusExtra = ethers.utils.parseEther("" + value * 1.03);
          console.log("valuePlusExtra", valuePlusExtra);
          let allowance = await props.readContracts[tokenName].allowance(
            props.address,
            props.readContracts[contractName].address,
          );
          console.log("allowance", allowance);

          let approveTx;
          if (allowance.lt(valuePlusExtra)) {
            approveTx = await tx(
              writeContracts[tokenName].approve(props.readContracts[contractName].address, valuePlusExtra, {
                gasLimit: 200000,
              }),
            );
          }

          let swapTx = tx(
            writeContracts[contractName]["tokenToEth"](valuePlusExtra, tokenAddress, { gasLimit: 200000 }),
          );
          if (approveTx) {
            console.log("waiting on approve to finish...");
            let approveTxResult = await approveTx;
            console.log("approveTxResult:", approveTxResult);
          }
          let swapTxResult = await swapTx;
          console.log("swapTxResult:", swapTxResult);
        })}
        <Divider>
          {" "}
          Total Liquidity For token (
          {liquidityPerToken ? Math.floor(ethers.utils.formatEther(liquidityPerToken)) : "none"}):
        </Divider>
        <Divider>
          {" "}
          Your Liquidity ({userLiquidity ? Math.floor(ethers.utils.formatEther(userLiquidity)) : "none"}):
        </Divider>

        {rowForm("deposit", "📥", async value => {
          let valueInEther = ethers.utils.parseEther("" + value);
          let allowance = await props.readContracts[tokenName].allowance(
            props.address,
            props.readContracts[contractName].address,
          );
          console.log("allowance", allowance);
          if (allowance.lt(valueInEther)) {
            await tx(
              writeContracts[tokenName].approve(props.readContracts[contractName].address, valueInEther, {
                gasLimit: 200000,
              }),
            );
          }
          await tx(writeContracts[contractName]["deposit"](tokenAddress, { value: valueInEther, gasLimit: 200000 }));
        })}

        {rowForm("withdraw", "📤", async value => {
          let valueInEther = ethers.utils.parseEther("" + value);
          let withdrawTxResult = await tx(writeContracts[contractName]["withdraw"](valueInEther, tokenAddress));
          console.log("withdrawTxResult:", withdrawTxResult);
        })}
      </div>,
    );
  }

  return (
    <Row span={24}>
      <Col span={12}>
        <Card
          title={
            <div>
              <Address value={contractAddress} />

              <div style={{ float: "right", fontSize: 24 }}>
                {contractBalanceByToken ? parseFloat(ethers.utils.formatEther(contractBalanceByToken)).toFixed(4) : 0}⚖️
                <TokenBalance
                  name={tokenName}
                  img={props.symbol}
                  address={contractAddress}
                  contracts={props.readContracts}
                />
                <Dropdown overlay={menu} trigger={["hover"]}>
                  <a
                    className="ant-dropdown-link"
                    onClick={e => e.preventDefault()}
                    style={{ color: "#d46b08", fontWeight: "bold", marginLeft: ".6rem" }}
                  >
                    TOKEN Pair <DownOutlined />
                  </a>
                </Dropdown>
              </div>
            </div>
          }
          size="large"
          loading={false}
        >
          {display}
        </Card>
        <Row span={12}>
          <Contract
            name={tokenName}
            signer={props.signer}
            provider={props.localProvider}
            show={["balanceOf", "approve"]}
            address={props.address}
            blockExplorer={props.blockExplorer}
            contractConfig={props.contractConfig}
            readContract={props.readContracts}
          />
        </Row>
      </Col>
      <Col span={12}>
        <div style={{ padding: 20 }}>
          <Curve
            addingEth={values && values["ethToToken"] ? values["ethToToken"] : 0}
            addingToken={values && values["tokenToEth"] ? values["tokenToEth"] : 0}
            ethReserve={contractBalanceByToken ? ethers.utils.formatEther(contractBalanceByToken) : 0}
            tokenReserve={tokenBalanceFloat}
            width={500}
            height={500}
          />
        </div>
      </Col>
    </Row>
  );
}
