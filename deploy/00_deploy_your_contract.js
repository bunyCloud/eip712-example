

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


//Deploy 
    await deploy("CalendarFactory", {
    from: deployer,
    //args: [calendar],
    log: true,
    waitConfirmations: 2,
  });

  
};
module.exports.tags = ["CalendarFactory"];
