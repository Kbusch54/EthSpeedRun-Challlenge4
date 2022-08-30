// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");

const localChainId = "31337";

// const sleep = (ms) =>
//   new Promise((r) =>
//     setTimeout(() => {
//       console.log(`waited for ${(ms / 1000).toFixed(3)} seconds`);
//       r();
//     }, ms)
//   );

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  // ==============================================================================
  // ==============================================================================
  // ==============================================================================

  await deploy("Balloons", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    // args: [ "Hello", ethers.utils.parseEther("1.5") ],
    log: true,
  });

  const balloons = await ethers.getContract("Balloons", deployer);

  // ==============================================================================
  // ==============================================================================
  // ==============================================================================
  await deploy("Monkey", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    // args: [ "Hello", ethers.utils.parseEther("1.5") ],
    log: true,
  });

  const monkey = await ethers.getContract("Monkey", deployer);
  // ==============================================================================
  // ==============================================================================
  // ==============================================================================

  await deploy("Frogger", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    // args: [ "Hello", ethers.utils.parseEther("1.5") ],
    log: true,
  });

  const frogger = await ethers.getContract("Frogger", deployer);
  // ==============================================================================// ==============================================================================// ==============================================================================

  await deploy("DEX", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    // args: [balloons.address],
    log: true,
    waitConfirmations: 5,
  });

  const dex = await ethers.getContract("DEX", deployer);

  // paste in your front-end address here to get 10 balloons on deploy:
  console.log("Transfering balloons / Froggers / Monkeys");
  await balloons.transfer(
    "0xE99A2E36dDfA90A5B3130FE65F5699b95005cf69",
    "" + 100 * 10 ** 18
  );
  await monkey.transfer(
    "0xE99A2E36dDfA90A5B3130FE65F5699b95005cf69",
    "" + 100 * 10 ** 18
  );
  await frogger.transfer(
    "0xE99A2E36dDfA90A5B3130FE65F5699b95005cf69",
    "" + 100 * 10 ** 18
  );

  // // uncomment to init DEX on deploy:
  console.log(
    "Approving DEX (" + dex.address + ") to take Balloons from main account..."
  );
  // If you are going to the testnet make sure your deployer account has enough ETH
  await balloons.approve(dex.address, ethers.utils.parseEther("100"));
  console.log("INIT exchange...");
  await dex.init(ethers.utils.parseEther("5"), balloons.address, {
    value: ethers.utils.parseEther("5"),
    gasLimit: 200000,
  });
  console.log("Approving DEX  to take Monkey from main account...");
  await monkey.approve(dex.address, ethers.utils.parseEther("100"));
  console.log("INIT exchange...");

  await dex.init(ethers.utils.parseEther("5"), monkey.address, {
    value: ethers.utils.parseEther("5"),
    gasLimit: 200000,
  });
  console.log("Approving DEX  to take Froggers from main account...");
  await frogger.approve(dex.address, ethers.utils.parseEther("100"));
  console.log("INIT exchange...");
  await dex.init(ethers.utils.parseEther("5"), frogger.address, {
    value: ethers.utils.parseEther("5"),

    gasLimit: 200000,
  });
};
module.exports.tags = ["Balloons", "DEX"];
