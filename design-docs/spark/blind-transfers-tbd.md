Specification

1. **Blinding phase**  
   Sender prepares a message `m = (new_pubkey, new_state_num, commitment)` and blinds it with factor `r`.
2. **Aggregate blind signing**  
   Each SO returns a blind MuSig2 partial. Aggregation yields σ′, a blind signature on `m`.
3. **Unblinding**  
   Sender computes σ = σ′ · r⁻¹ and hands `{m, σ}` to the recipient as a **ticket**.
4. **Verification**  
   Recipient unpacks `m`, verifies σ under the federation pubkey and checks `new_state_num` ⇒ current + 1.
5. **Broadcast**  
   Recipient becomes the new owner and can either spend, re-transfer or exit chained off-chain.

_All complexity is wallet-side; the SO RPC surface shrinks to `blind_sign(blinded_payload)`._

Security section

- **Recipient safety.** Must validate the full signature chain and monotonic `state_num`.
- **SO audit limits.** Blindness removes direct replay detection; recipients and watchtowers enforce ordering. [sourc](https://gnusha.org/pi/bitcoindev/CAPv7TjZ_MBCmWZ5CnUk0G0MhHL65cpGyt_dMDONDTzJBHpVUQg%40mail.gmail.com/?utm_source=chatgpt.com)
- **Spam / DoS.** SOs SHOULD require fee-rate or stake quota per blinded request.

Open Questions

1. Can we commit to the next `state_num` inside the blinded payload without leaking ownership?
2. Fee model for blind-sign RPC — sat/byte equivalent or stake?
3. Should equal-value swap coordination be standardised in this SIP or a follow-up?
4. Legal & compliance review: does blinded signing alter MSB / VASP status of the federation?
