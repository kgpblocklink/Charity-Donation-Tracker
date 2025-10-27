import { expect } from "chai";
import { ethers } from "hardhat";

describe("Charity Donation Tracker", function () {
  let Charity: any, charity: any, owner: any, donor1: any, donor2: any;

  beforeEach(async function () {
    [owner, donor1, donor2] = await ethers.getSigners();
    Charity = await ethers.getContractFactory("CharityDonation");
    charity = await Charity.deploy();
    await charity.waitForDeployment();
  });

  it("should accept donations and track total funds", async function () {
    await charity.connect(donor1).donate({ value: ethers.parseEther("1") });
    await charity.connect(donor2).donate({ value: ethers.parseEther("2") });

    const total = await charity.totalFunds();
    expect(total).to.equal(ethers.parseEther("3"));
  });

  it("should record each donor’s contribution", async function () {
    await charity.connect(donor1).donate({ value: ethers.parseEther("0.5") });
    const amount = await charity.donations(donor1.address);
    expect(amount).to.equal(ethers.parseEther("0.5"));
  });

  it("should allow only owner to withdraw funds", async function () {
    await charity.connect(donor1).donate({ value: ethers.parseEther("1") });
    await expect(
      charity.connect(donor1).withdraw(ethers.parseEther("0.5"))
    ).to.be.revertedWith("Only owner can withdraw");

    await expect(charity.connect(owner).withdraw(ethers.parseEther("0.5")))
      .to.emit(charity, "FundsWithdrawn")
      .withArgs(owner.address, ethers.parseEther("0.5"));
  });

  it("should reject withdrawal beyond balance", async function () {
    await expect(
      charity.connect(owner).withdraw(ethers.parseEther("5"))
    ).to.be.revertedWith("Insufficient funds");
  });
});
