import { describe, expect, it } from "vitest";
import { cardHolderFromConfirmation, splitName, toPayphonePhone } from "./payphone-holder";

describe("payphone card holder", () => {
  it("reads the holder data returned by V2/Confirm", () => {
    expect(cardHolderFromConfirmation({ optionalParameter4: "ANA MARIA PEREZ", email: "ana@mail.com", phoneNumber: "593991112222", document: "0912345678" })).toEqual({ name: "ANA MARIA PEREZ", email: "ana@mail.com", phoneNumber: "593991112222", documentId: "0912345678" });
    expect(cardHolderFromConfirmation(null)).toEqual({ name: undefined, email: undefined, phoneNumber: undefined, documentId: undefined });
  });

  it("formats Ecuadorian phones as country code + number", () => {
    expect(toPayphonePhone("099 111 2222")).toBe("593991112222");
    expect(toPayphonePhone("+593 99 111 2222")).toBe("593991112222");
    expect(toPayphonePhone("991112222")).toBe("593991112222");
  });

  it("splits holder names for billTo", () => {
    expect(splitName("ANA PEREZ")).toEqual({ firstName: "ANA", lastName: "PEREZ" });
    expect(splitName("ANA MARIA PEREZ LOPEZ")).toEqual({ firstName: "ANA MARIA", lastName: "PEREZ LOPEZ" });
  });
});
