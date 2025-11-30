# medicine supply chain

so basically this is a blockchain thingy for tracking meds. we use batches cause its cheaper on gas and thats how real pharmacies do it.

## how to run

### what u need
- nodejs (v16 or whatever)
- metamask
- git

### install stuff
just copy paste this:
```bash
# clone & install
git clone <repository-url>
cd medblocks
npm install
cd frontend && npm install && cd ..
```

### run it
u need 3 terminals for this. dont ask why.

terminal 1 (blockchain):
```bash
npx hardhat node
```

terminal 2 (contract):
```bash
npx hardhat run scripts/deploy.js --network localhost
```

terminal 3 (frontend):
```bash
cd frontend && npm start
```

## what it does

### smart contract
- tracks batches of meds (not one by one, thats too expensive)
- different roles: producer, distributor, pharmacy
- distributors can send to other distributors or pharmacy
- checks expiry dates
- keeps a record of everything


### flow
producer -> distributor -> pharmacy

### frontend
- works with metamask
- different screens for different roles
- make batches and move them around
- see where stuff is
- check if meds are expired

## commands u might need

```bash
# compile stuff
npx hardhat compile

# start blockchain
npx hardhat node

# run tests
npx hardhat test

# deploy
npx hardhat run scripts/deploy-simple.js --network localhost

# test everything
npx hardhat run scripts/test-full-flow.js --network localhost

# debug
npx hardhat run scripts/debug-contract.js --network localhost

# start frontend
cd frontend && npm start
```

## if it breaks

### common problems
if ports are busy:
```bash
npx kill-port 8545
npx kill-port 3000
```

if u need to reset:
```bash
npx hardhat clean
npx hardhat compile
```

check if contract is alive:
```bash
npx hardhat run scripts/debug-contract.js --network localhost
```

### metamask setup
- network name: hardhat local
- rpc url: http://localhost:8545
- chain id: 1337
- currency: eth

## folders
- contracts: where the smart contract lives
- scripts: deployment and test scripts
- frontend: the react app
- test: tests
