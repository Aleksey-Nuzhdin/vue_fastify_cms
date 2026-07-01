export {}

declare global {
  type ExplicitPick<
    T,
    TInclude extends keyof T,
    TExclude extends Exclude<keyof T, TInclude> = never 
  > = [Exclude<keyof T, TInclude | TExclude>] extends [never]
    ? Pick<T, TInclude>
    : 'Ошибка: не все поля обработаны'
}